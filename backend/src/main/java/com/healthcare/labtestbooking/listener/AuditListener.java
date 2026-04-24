package com.healthcare.labtestbooking.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Persistence;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKey;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Transient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Slf4j
public class AuditListener {

    private static final Map<Object, String> ORIGINAL_SNAPSHOT = Collections.synchronizedMap(new IdentityHashMap<>());

    private static ObjectMapper objectMapper;
    private static EntityManager entityManager;
    private static ApplicationEventPublisher eventPublisher;

    public AuditListener() {
    }

    @Autowired
    public void setDependencies(ObjectMapper mapper, EntityManager em, ApplicationEventPublisher publisher) {
        objectMapper = mapper;
        entityManager = em;
        eventPublisher = publisher;
    }

    @PostLoad
    public void captureOriginal(Object entity) {
        if (entity instanceof AuditLog) {
            return;
        }
        ORIGINAL_SNAPSHOT.put(entity, toJson(entity));
    }

    @PostPersist
    public void afterCreate(Object entity) {
        if (entity instanceof AuditLog) {
            return;
        }
        writeAudit(entity, "CREATE", null, toJson(entity));
        ORIGINAL_SNAPSHOT.put(entity, toJson(entity));
    }

    @PreUpdate
    public void beforeUpdate(Object entity) {
        if (entity instanceof AuditLog) {
            return;
        }
        String oldValue = ORIGINAL_SNAPSHOT.remove(entity);
        writeAudit(entity, "UPDATE", oldValue, toJson(entity));
        ORIGINAL_SNAPSHOT.put(entity, toJson(entity));
    }

    @PreRemove
    public void beforeDelete(Object entity) {
        if (entity instanceof AuditLog) {
            return;
        }
        writeAudit(entity, "DELETE", toJson(entity), null);
        ORIGINAL_SNAPSHOT.remove(entity);
    }

    private void writeAudit(Object entity, String action, String oldValue, String newValue) {
        if (eventPublisher == null) {
            log.warn("Audit listener skipped: ApplicationEventPublisher not initialized");
            return;
        }

        String username = resolveUsername();
        Long userId = resolveUserId(username);
        String entityName = entity.getClass().getSimpleName();
        String entityId = resolveEntityId(entity);

        AuditLogEvent event = new AuditLogEvent(entityName, entityId, action, userId, username, oldValue, newValue);
        eventPublisher.publishEvent(event);
    }

    private String resolveUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return "system";
        }
        return authentication.getName();
    }

    private Long resolveUserId(String username) {
        // DO NOT query the database here. It is illegal during @PostPersist flush and
        // causes AssertionFailure.
        // AuditLogProcessor will handle resolving the ID in a new transaction.
        return null;
    }

    private String resolveEntityId(Object entity) {
        if (entityManager == null) {
            return "";
        }
        Object id = entityManager.getEntityManagerFactory()
                .getPersistenceUnitUtil()
                .getIdentifier(entity);
        return id == null ? "" : String.valueOf(id);
    }

    private String toJson(Object entity) {
        try {
            ObjectMapper mapper = getMapper();
            return mapper.writeValueAsString(extractState(entity));
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialize audit snapshot for {}", entity.getClass().getSimpleName(), ex);
            return "{}";
        }
    }

    private ObjectMapper getMapper() {
        if (objectMapper != null) {
            return objectMapper;
        }
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    private Map<String, Object> extractState(Object entity) {
        Map<String, Object> state = new LinkedHashMap<>();
        Class<?> type = entity.getClass();
        while (type != null && type != Object.class) {
            for (Field field : type.getDeclaredFields()) {
                if (Modifier.isStatic(field.getModifiers()) || Modifier.isTransient(field.getModifiers())) {
                    continue;
                }
                if (field.isAnnotationPresent(Transient.class)) {
                    continue;
                }
                field.setAccessible(true);
                Object value = readFieldValue(field, entity);
                state.put(field.getName(), value);
            }
            type = type.getSuperclass();
        }
        return state;
    }

    private Object readFieldValue(Field field, Object entity) {
        try {
            if (isAssociationField(field) && !Persistence.getPersistenceUtil().isLoaded(entity, field.getName())) {
                // Skip unloaded lazy relationships to avoid audit-triggered N+1 queries.
                return null;
            }

            Object value = field.get(entity);
            if (value == null) {
                return null;
            }
            if (field.isAnnotationPresent(ManyToOne.class) || field.isAnnotationPresent(OneToOne.class)) {
                return resolveEntityId(value);
            }
            if (field.isAnnotationPresent(OneToMany.class) || value instanceof Collection) {
                // Avoid initializing lazy collections (e.g. bookings) during audit snapshot
                // to prevent unnecessary queries during startup / system operations.
                return null;
            }
            if (field.isAnnotationPresent(MapKey.class) || value instanceof Map) {
                return value instanceof Map<?, ?> map ? map.size() : null;
            }
            if (value instanceof Enum<?> || value instanceof Number || value instanceof Boolean
                    || value instanceof String || value instanceof LocalDate || value instanceof LocalDateTime) {
                return value;
            }
            return String.valueOf(value);
        } catch (IllegalAccessException ex) {
            return null;
        }
    }

    private boolean isAssociationField(Field field) {
        return field.isAnnotationPresent(ManyToOne.class)
                || field.isAnnotationPresent(OneToOne.class)
                || field.isAnnotationPresent(OneToMany.class)
                || field.isAnnotationPresent(MapKey.class);
    }
}
