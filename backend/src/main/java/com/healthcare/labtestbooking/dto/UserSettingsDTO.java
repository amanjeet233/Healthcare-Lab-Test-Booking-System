package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsDTO {
    private NotificationSettings notifications;
    private PrivacySettings privacy;
    private AppearanceSettings appearance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationSettings {
        private Boolean emailNotifications;
        private Boolean smsNotifications;
        private Boolean whatsappNotifications;
        private Boolean reportReady;
        private Boolean bookingReminder;
        private Boolean healthAlerts;
        private Boolean marketingEmails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrivacySettings {
        private Boolean twoFactorAuth;
        private Boolean privacyMode;
        private Boolean shareWithDoctor;
        private Boolean shareWithFamily;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppearanceSettings {
        private String theme;
        private String language;
        private String communicationChannel;
    }
}
