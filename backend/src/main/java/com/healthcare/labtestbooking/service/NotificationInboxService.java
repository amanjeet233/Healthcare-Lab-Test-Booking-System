package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.NotificationResponse;
import com.healthcare.labtestbooking.entity.Notification;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.NotificationRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("notificationInboxService")
@RequiredArgsConstructor
@Slf4j
public class NotificationInboxService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Notification createNotification(Long userId, String type, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created for user {}: [{}] {}", userId, type, title);
        return saved;
    }

    public Notification createNotification(Long userId, String type, String title, String message,
            String referenceType, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created for user {}: [{}] {} (ref: {}#{})", userId, type, title, referenceType,
                referenceId);
        return saved;
    }

    public Page<NotificationResponse> getUserNotifications(Pageable pageable) {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    public List<NotificationResponse> getUnreadNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        User user = getCurrentUser();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: notification does not belong to user");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional
    public int markAllRead() {
        User user = getCurrentUser();
        int count = notificationRepository.markAllReadByUserId(user.getId());
        log.info("Marked {} notifications as read for user {}", count, user.getId());
        return count;
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        User user = getCurrentUser();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: notification does not belong to user");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification {} for user {}", notificationId, user.getId());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
