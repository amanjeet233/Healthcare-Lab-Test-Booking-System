package com.healthcare.labtestbooking.listener;

import com.healthcare.labtestbooking.entity.AuditLog;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditLogProcessor {

    private final EntityManager entityManager;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processAuditLogEvent(AuditLogEvent event) {
        if (entityManager == null) {
            log.warn("Audit processor skipped: EntityManager not initialized");
            return;
        }

        Long resolvedUserId = event.getUserId();
        if (resolvedUserId == null && event.getUsername() != null && !"system".equals(event.getUsername())) {
            try {
                // Since this is a new transaction, querying is completely safe
                java.util.List<Long> ids = entityManager
                        .createQuery("SELECT u.id FROM User u WHERE u.email = :email", Long.class)
                        .setParameter("email", event.getUsername())
                        .getResultList();
                if (!ids.isEmpty()) {
                    resolvedUserId = ids.get(0);
                }
            } catch (Exception e) {
                log.warn("Could not resolve user ID for audit log: {}", e.getMessage());
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .entityName(event.getEntityName())
            .entityType(event.getEntityName() != null ? event.getEntityName() : "SYSTEM")
                .entityId(event.getEntityId())
                .action(event.getAction())
                .userId(resolvedUserId)
                .username(event.getUsername())
                .timestamp(LocalDateTime.now())
                .oldValue(event.getOldValue())
                .newValue(event.getNewValue())
                .build();

        entityManager.persist(auditLog);
    }
}
