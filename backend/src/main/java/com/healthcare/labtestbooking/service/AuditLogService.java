package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog saveAuditLog(AuditLog auditLog) {
        log.info("Saving audit log for entity: {} with action: {}", auditLog.getEntityName(), auditLog.getAction());
        return auditLogRepository.save(auditLog);
    }

    /**
     * Convenience method to record a sensitive action asynchronously.
     * Fire-and-forget — never throws so that the calling transaction is not affected.
     */
    @Async
    @Transactional
    public void logAction(Long userId, String userEmail, String userRole,
                          String action, String entityType, String entityId,
                          String details, String ipAddress) {
        try {
            AuditLog log = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .username(userEmail)
                    .userRole(userRole)
                    .action(action)
                    .entityName(entityType != null ? entityType : "SYSTEM")
                    .entityType(entityType != null ? entityType : "SYSTEM")
                    .entityId(entityId != null ? entityId : "N/A")
                    .newValue(details)
                    .ipAddress(ipAddress != null ? ipAddress : "N/A")
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(log);
        } catch (Exception ex) {
            // Audit must never break the primary transaction
            this.log.error("Failed to persist audit log [action={}]: {}", action, ex.getMessage());
        }
    }

    public List<AuditLog> getAuditLogsForEntity(String entityName, String entityId) {
        return auditLogRepository.findByEntityNameAndEntityId(entityName, entityId);
    }

    public List<AuditLog> getAuditLogsForUser(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getAuditLogsInTimeRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetween(start, end);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    public Page<AuditLog> getPaginatedAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public Page<AuditLog> getFilteredAuditLogs(String action, String userRole,
                                                LocalDateTime from, LocalDateTime to,
                                                Pageable pageable) {
        return auditLogRepository.findWithFilters(action, userRole, from, to, pageable);
    }
}
