package com.healthcare.labtestbooking.audit;

import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Audit Aspect
 * Logs all actions marked with @Auditable annotation
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(auditable)")
    public Object auditAction(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        long startTime = System.currentTimeMillis();
        Exception exception = null;
        Object result = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            try {
                long executionTime = System.currentTimeMillis() - startTime;
                logAudit(joinPoint, auditable, executionTime, exception);
            } catch (Exception e) {
                log.error("Error logging audit", e);
            }
        }
    }

    private void logAudit(ProceedingJoinPoint joinPoint, Auditable auditable,
                         long executionTime, Exception exception) {
        try {
            String action = auditable.action().isEmpty()
                    ? joinPoint.getSignature().getName()
                    : auditable.action();

            String className = joinPoint.getTarget().getClass().getSimpleName();

            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntityName(className);
            auditLog.setEntityId(String.valueOf(System.currentTimeMillis()));
            auditLog.setTimestamp(LocalDateTime.now());
            if (exception != null) {
                auditLog.setOldValue("ERROR: " + exception.getClass().getSimpleName());
            }

            auditLogRepository.save(auditLog);

            log.info("Audit: {} - {} - {}ms - {}",
                    action, className, executionTime,
                    exception == null ? "SUCCESS" : "FAILED");

        } catch (Exception e) {
            log.error("Failed to log audit action", e);
        }
    }

}

