package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.UserResponse;
import com.healthcare.labtestbooking.dto.UserSettingsDTO;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UserResponse request) {
        User user = getCurrentUser();

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone()) &&
                    !request.getPhone().equals(user.getPhone())) {
                throw new RuntimeException("Phone number is already registered");
            }
            user.setPhone(request.getPhone());
        }
        if (request.getSecondaryPhone() != null) {
            user.setSecondaryPhone(request.getSecondaryPhone());
        }
        if (request.getAlternateEmail() != null) {
            user.setAlternateEmail(request.getAlternateEmail());
        }
        if (request.getMaritalStatus() != null) {
            user.setMaritalStatus(request.getMaritalStatus());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            user.setDateOfBirth(java.time.LocalDate.parse(request.getDateOfBirth()));
        }
        if (request.getBloodGroup() != null) {
            user.setBloodGroup(request.getBloodGroup());
        }
        if (request.getGender() != null && !request.getGender().isBlank()) {
            user.setGender(Gender.valueOf(request.getGender().trim().toUpperCase(Locale.ROOT)));
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public UserSettingsDTO getCurrentUserSettings() {
        User user = getCurrentUser();
        return UserSettingsDTO.builder()
                .notifications(UserSettingsDTO.NotificationSettings.builder()
                        .emailNotifications(user.getNotificationsEnabled() != null ? user.getNotificationsEnabled() : Boolean.TRUE)
                        .smsNotifications(Boolean.TRUE)
                        .whatsappNotifications(user.getWhatsappNotifications() != null ? user.getWhatsappNotifications() : Boolean.TRUE)
                        .reportReady(Boolean.TRUE)
                        .bookingReminder(Boolean.TRUE)
                        .healthAlerts(Boolean.TRUE)
                        .marketingEmails(user.getMarketingEmails() != null ? user.getMarketingEmails() : Boolean.FALSE)
                        .build())
                .privacy(UserSettingsDTO.PrivacySettings.builder()
                        .twoFactorAuth(user.getTwoFactorAuth() != null ? user.getTwoFactorAuth() : Boolean.FALSE)
                        .privacyMode(user.getPrivacyMode() != null ? user.getPrivacyMode() : Boolean.FALSE)
                        .shareWithDoctor(Boolean.TRUE)
                        .shareWithFamily(Boolean.TRUE)
                        .build())
                .appearance(UserSettingsDTO.AppearanceSettings.builder()
                        .theme(user.getThemePreference() != null ? user.getThemePreference() : "light")
                        .language(user.getLanguagePreference() != null ? user.getLanguagePreference() : "en")
                        .communicationChannel(user.getCommunicationChannel() != null ? user.getCommunicationChannel() : "both")
                        .build())
                .build();
    }

    @Transactional
    public UserSettingsDTO updateCurrentUserSettings(UserSettingsDTO request) {
        User user = getCurrentUser();
        if (request == null) {
            return getCurrentUserSettings();
        }

        if (request.getNotifications() != null) {
            UserSettingsDTO.NotificationSettings n = request.getNotifications();
            if (n.getEmailNotifications() != null) user.setNotificationsEnabled(n.getEmailNotifications());
            if (n.getWhatsappNotifications() != null) user.setWhatsappNotifications(n.getWhatsappNotifications());
            if (n.getMarketingEmails() != null) user.setMarketingEmails(n.getMarketingEmails());
        }

        if (request.getPrivacy() != null) {
            UserSettingsDTO.PrivacySettings p = request.getPrivacy();
            if (p.getTwoFactorAuth() != null) user.setTwoFactorAuth(p.getTwoFactorAuth());
            if (p.getPrivacyMode() != null) user.setPrivacyMode(p.getPrivacyMode());
        }

        if (request.getAppearance() != null) {
            UserSettingsDTO.AppearanceSettings a = request.getAppearance();
            if (a.getTheme() != null && !a.getTheme().isBlank()) user.setThemePreference(a.getTheme());
            if (a.getLanguage() != null && !a.getLanguage().isBlank()) user.setLanguagePreference(a.getLanguage());
            if (a.getCommunicationChannel() != null && !a.getCommunicationChannel().isBlank()) {
                user.setCommunicationChannel(a.getCommunicationChannel());
            }
        }

        userRepository.save(user);
        return getCurrentUserSettings();
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admin can view all users");
        }

        return userRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, Boolean isActive) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admin can update user status");
        }

        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (userToUpdate.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Cannot deactivate admin users");
        }

        userToUpdate.setIsActive(isActive);
        userToUpdate = userRepository.save(userToUpdate);
        return mapToResponse(userToUpdate);
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().name())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .secondaryPhone(user.getSecondaryPhone())
                .alternateEmail(user.getAlternateEmail())
                .maritalStatus(user.getMaritalStatus())
                .dateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null)
                .bloodGroup(user.getBloodGroup())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .notificationsEnabled(user.getNotificationsEnabled())
                .whatsappNotifications(user.getWhatsappNotifications())
                .marketingEmails(user.getMarketingEmails())
                .privacyMode(user.getPrivacyMode())
                .themePreference(user.getThemePreference())
                .build();
    }
}
