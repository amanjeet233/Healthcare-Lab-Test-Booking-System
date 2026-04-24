package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logAction(Long userId, String userEmail, String userRole,
                          String action, String entityType, String entityId, String details) {
        logAction(userId, userEmail, userRole, action, entityType, entityId, details, null);
    }

    @Async
    @Transactional
    public void logAction(Long userId, String userEmail, String userRole,
                          String action, String entityType, String entityId,
                          String details, String ipAddress) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .username(userEmail)
                    .userRole(userRole)
                    .action(action)
                    .entityName(entityType != null ? entityType : "SYSTEM")
                    .entityType(entityType != null ? entityType : "SYSTEM")
                    .entityId(entityId != null ? entityId : "N/A")
                    .oldValue(null)
                    .newValue(details)
                    .ipAddress(ipAddress != null ? ipAddress : "N/A")
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Failed to persist audit log [action={}]: {}", action, ex.getMessage());
        }
    }
}
