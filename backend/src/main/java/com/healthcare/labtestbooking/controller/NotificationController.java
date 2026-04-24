package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.NotificationResponse;
import com.healthcare.labtestbooking.entity.Notification;
import com.healthcare.labtestbooking.entity.NotificationLog;
import com.healthcare.labtestbooking.repository.NotificationLogRepository;
import com.healthcare.labtestbooking.service.NotificationInboxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification inbox management")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationInboxService notificationInboxService;
    private final NotificationLogRepository notificationLogRepository;

    @GetMapping
    @Operation(summary = "Get all notifications", description = "Retrieve all notifications for the authenticated user")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUserNotifications(@PageableDefault(size = 20) Pageable pageable) {
        Page<NotificationResponse> notifications = notificationInboxService.getUserNotifications(pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve only unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications() {
        List<NotificationResponse> notifications = notificationInboxService.getUnreadNotifications();
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Unread count", description = "Get the number of unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationInboxService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark as read", description = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        NotificationResponse notification = notificationInboxService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", notification));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for the authenticated user")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead() {
        int count = notificationInboxService.markAllRead();
        return ResponseEntity.ok(ApiResponse.success("All marked as read", Map.of("markedCount", count)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationInboxService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    /**
     * Admin endpoint: returns notification delivery logs for a specific booking.
     * Useful for verifying that the patient received their preparation instructions.
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Notification log for booking", description = "Returns notification delivery log entries for a specific booking (Admin only)")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getNotificationLogForBooking(@PathVariable Long bookingId) {
        List<NotificationLog> logs = notificationLogRepository.findByBookingIdOrderBySentAtDesc(bookingId);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}


