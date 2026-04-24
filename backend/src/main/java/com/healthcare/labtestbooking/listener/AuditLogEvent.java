package com.healthcare.labtestbooking.listener;

import lombok.Getter;

@Getter
public class AuditLogEvent {
    private final String entityName;
    private final String entityId;
    private final String action;
    private final Long userId;
    private final String username;
    private final String oldValue;
    private final String newValue;

    public AuditLogEvent(String entityName, String entityId, String action, Long userId, String username,
            String oldValue, String newValue) {
        this.entityName = entityName;
        this.entityId = entityId;
        this.action = action;
        this.userId = userId;
        this.username = username;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
}
