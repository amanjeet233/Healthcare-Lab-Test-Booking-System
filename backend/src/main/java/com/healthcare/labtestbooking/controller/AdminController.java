package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.service.AuditLogService;
import com.healthcare.labtestbooking.service.AuditService;
import com.healthcare.labtestbooking.service.BookingService;
import com.healthcare.labtestbooking.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final DashboardService dashboardService;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final AuditService auditService;
    private final BookingService bookingService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        log.info("GET /api/admin/stats");
        Map<String, Object> stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) String role) {
        log.info("GET /api/admin/users page={} size={} role={}",
                pageable.getPageNumber(), pageable.getPageSize(), role);
        Page<User> usersPage;
        if (role != null && !role.isBlank()) {
            try {
                UserRole roleEnum = UserRole.valueOf(role.toUpperCase());
                usersPage = userRepository.findByRole(roleEnum, pageable);
            } catch (IllegalArgumentException e) {
                usersPage = userRepository.findAll(pageable);
            }
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        Page<Map<String, Object>> result = usersPage.map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("status", Boolean.TRUE.equals(u.getIsActive()) ? "ACTIVE" : "INACTIVE");
            m.put("createdAt", u.getCreatedAt());
            m.put("joinDate", u.getCreatedAt());
            return m;
        });

        return ResponseEntity.ok(ApiResponse.success("Users fetched", result));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal,
            HttpServletRequest request) {
        log.info("PUT /api/admin/users/{}/role", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String oldRole = user.getRole().name();
        try {
            user.setRole(UserRole.valueOf(body.get("role").toUpperCase()));
            userRepository.save(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role: " + body.get("role")));
        }
        User admin = userRepository.findByEmail(principal.getUsername()).orElse(null);
        auditService.logAction(
                admin != null ? admin.getId() : null,
                principal.getUsername(), "ADMIN",
                "ROLE_CHANGED", "USER", String.valueOf(userId),
                "Role changed from " + oldRole + " to " + body.get("role"),
                request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Role updated", "OK"));
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal,
            HttpServletRequest request) {
        log.info("PUT /api/admin/users/{}/toggle-status", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        String newStatus = Boolean.TRUE.equals(user.getIsActive()) ? "ACTIVE" : "INACTIVE";

        User admin = userRepository.findByEmail(principal.getUsername()).orElse(null);
        auditService.logAction(
                admin != null ? admin.getId() : null,
                principal.getUsername(), "ADMIN",
                "USER_STATUS_TOGGLED", "USER", String.valueOf(userId),
                "Status toggled to " + newStatus + " for user " + user.getEmail(),
                request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Status toggled", newStatus));
    }

    // ── Real chart data (last 7 days) ─────────────────────────────────────────

    @GetMapping("/charts/{type}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChartData(
            @PathVariable String type) {
        log.info("GET /api/admin/charts/{}", type);
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        List<Map<String, Object>> data = new ArrayList<>();

        if ("revenue".equals(type)) {
            // Revenue grouped by date for COMPLETED bookings
            List<Object[]> rows = bookingRepository.sumRevenueByCreatedDateRange(startDate, endDate);
            Map<LocalDate, BigDecimal> byDate = new HashMap<>();
            for (Object[] row : rows) {
                LocalDate d = (LocalDate) row[0];
                BigDecimal v = row[1] instanceof BigDecimal ? (BigDecimal) row[1]
                        : new BigDecimal(row[1].toString());
                byDate.put(d, v);
            }
            for (int i = 6; i >= 0; i--) {
                LocalDate d = endDate.minusDays(i);
                Map<String, Object> point = new HashMap<>();
                point.put("date", d.toString());
                point.put("value", byDate.getOrDefault(d, BigDecimal.ZERO).doubleValue());
                point.put("label", d.getDayOfWeek().toString().substring(0, 3));
                data.add(point);
            }
        } else {
            // Bookings / growth: count per day
            List<Object[]> rows = bookingRepository.countBookingsByCreatedDateRange(startDate, endDate);
            Map<LocalDate, Long> byDate = new HashMap<>();
            for (Object[] row : rows) {
                LocalDate d = row[0] instanceof LocalDate ? (LocalDate) row[0]
                        : LocalDate.parse(row[0].toString());
                long count = ((Number) row[1]).longValue();
                byDate.put(d, count);
            }
            for (int i = 6; i >= 0; i--) {
                LocalDate d = endDate.minusDays(i);
                Map<String, Object> point = new HashMap<>();
                point.put("date", d.toString());
                point.put("value", byDate.getOrDefault(d, 0L));
                point.put("label", d.getDayOfWeek().toString().substring(0, 3));
                data.add(point);
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Chart data", data));
    }

    // ── Real revenue data ─────────────────────────────────────────────────────

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenue(
            @RequestParam(defaultValue = "week") String period) {
        log.info("GET /api/admin/revenue period={}", period);
        int days = "month".equals(period) ? 30 : 7;
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        List<Object[]> rows = bookingRepository.sumRevenueByCreatedDateRange(startDate, endDate);
        Map<LocalDate, BigDecimal> byDate = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate d = (LocalDate) row[0];
            BigDecimal v = row[1] instanceof BigDecimal ? (BigDecimal) row[1]
                    : new BigDecimal(row[1].toString());
            byDate.put(d, v);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = endDate.minusDays(i);
            Map<String, Object> point = new HashMap<>();
            point.put("date", d.toString());
            point.put("value", byDate.getOrDefault(d, BigDecimal.ZERO).doubleValue());
            data.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success("Revenue data", data));
    }

    // ── Paginated, filtered audit log endpoint ────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        log.info("GET /api/admin/audit-logs page={} size={} action={} userRole={} from={} to={}",
                page, size, action, userRole, from, to);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt   = to   != null ? to.atTime(23, 59, 59) : null;

        boolean hasFilters = (action != null && !action.isBlank())
                || (userRole != null && !userRole.isBlank())
                || fromDt != null || toDt != null;

        Page<AuditLog> logs = hasFilters
                ? auditLogService.getFilteredAuditLogs(
                        (action != null && !action.isBlank()) ? action : null,
                        (userRole != null && !userRole.isBlank()) ? userRole : null,
                        fromDt, toDt, pageable)
                : auditLogService.getPaginatedAuditLogs(pageable);

        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched", logs));
    }

    @GetMapping("/bookings/trends")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingTrends() {
        log.info("GET /api/admin/bookings/trends");
        List<Map<String, Object>> data = new ArrayList<>();
        for (BookingStatus status : BookingStatus.values()) {
            Map<String, Object> point = new HashMap<>();
            point.put("status", status.name());
            point.put("value", bookingRepository.countByStatus(status));
            data.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success("Booking trends", data));
    }

    @PutMapping("/bookings/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> completeBooking(@PathVariable Long id) {
        BookingResponse response = bookingService.adminUpdateBookingStatus(id, BookingStatus.COMPLETED, null);
        return ResponseEntity.ok(ApiResponse.success("Booking completed", response));
    }

    @GetMapping("/bookings/critical")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCriticalBookings() {
        log.info("GET /api/admin/bookings/critical");
        List<Map<String, Object>> data = bookingRepository
                .findByCriticalFlagTrueAndStatusNotOrderByCreatedAtDesc(BookingStatus.COMPLETED)
                .stream()
                .map(b -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", b.getId());
                    m.put("bookingReference", b.getBookingReference());
                    m.put("patientName", b.getPatientDisplayName());
                    m.put("testName", b.getTest() != null
                            ? b.getTest().getTestName()
                            : (b.getTestPackage() != null ? b.getTestPackage().getPackageName() : "Lab Test"));
                    LocalDateTime flaggedDate = auditLogRepository
                            .findTopByActionAndEntityNameAndEntityIdOrderByTimestampDesc(
                                    "BOOKING_FLAGGED_CRITICAL", "BOOKING", String.valueOf(b.getId()))
                            .map(AuditLog::getTimestamp)
                            .orElse(b.getCreatedAt());
                    m.put("flaggedDate", flaggedDate);
                    m.put("status", b.getStatus() != null ? b.getStatus().name() : null);
                    m.put("bookingDate", b.getBookingDate());
                    m.put("timeSlot", b.getTimeSlot());
                    m.put("technicianName", b.getTechnician() != null ? b.getTechnician().getName() : null);
                    m.put("collectionType", b.getCollectionType() != null ? b.getCollectionType().name() : null);
                    m.put("collectionAddress", b.getCollectionAddress());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Critical bookings fetched", data));
    }

    // ── Create staff account (TECHNICIAN or MEDICAL_OFFICER) ──────────────────

    @PostMapping("/staff")
    @CacheEvict(value = "adminStats", allEntries = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStaff(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal,
            HttpServletRequest request) {
        log.info("POST /api/admin/staff - creating staff account");

        String name     = body.getOrDefault("name", "").trim();
        String email    = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "password123");
        String roleStr  = body.getOrDefault("role", "").trim().toUpperCase();
        String phone    = body.getOrDefault("phone", "").trim();

        if (name.isEmpty() || email.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Name and email are required"));
        }
        if (!roleStr.equals("TECHNICIAN") && !roleStr.equals("MEDICAL_OFFICER")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Role must be TECHNICIAN or MEDICAL_OFFICER"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email already registered: " + email));
        }

        UserRole role = UserRole.valueOf(roleStr);
        User staff = new User();
        staff.setName(name);
        staff.setEmail(email);
        staff.setPassword(passwordEncoder.encode(password));
        staff.setRole(role);
        staff.setPhone(phone.isEmpty() ? "0000000000" : phone);
        staff.setIsActive(true);
        staff.setIsVerified(true);
        staff.setCreatedAt(LocalDateTime.now());
        staff.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(staff);

        User admin = userRepository.findByEmail(principal.getUsername()).orElse(null);
        auditService.logAction(
                admin != null ? admin.getId() : null,
                principal.getUsername(), "ADMIN",
                "STAFF_CREATED", "USER", String.valueOf(saved.getId()),
                "Created " + roleStr + " account for " + email,
                request.getRemoteAddr());

        Map<String, Object> result = Map.of(
                "id", saved.getId(),
                "name", saved.getName(),
                "email", saved.getEmail(),
                "role", saved.getRole().name(),
                "message", role.name() + " account created successfully"
        );

        return ResponseEntity.ok(ApiResponse.success("Staff created", result));
    }

    // ── Delete staff account ───────────────────────────────────────────────────

    @DeleteMapping("/staff/{userId}")
    @CacheEvict(value = "adminStats", allEntries = true)
    public ResponseEntity<ApiResponse<String>> deleteStaff(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails principal,
            HttpServletRequest request) {
        log.info("DELETE /api/admin/staff/{}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (user.getRole() == UserRole.PATIENT) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Cannot delete patient accounts from here"));
        }
        if (user.getRole() == UserRole.ADMIN) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Cannot delete admin accounts"));
        }

        String deletedEmail = user.getEmail();
        String deletedRole  = user.getRole().name();
        userRepository.delete(user);

        User admin = userRepository.findByEmail(principal.getUsername()).orElse(null);
        auditService.logAction(
                admin != null ? admin.getId() : null,
                principal.getUsername(), "ADMIN",
                "STAFF_DELETED", "USER", String.valueOf(userId),
                "Deleted " + deletedRole + " account: " + deletedEmail,
                request.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Staff account deleted", "OK"));
    }

    @GetMapping("/staff/technicians-only")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTechniciansOnly() {
        log.info("GET /api/admin/staff/technicians-only");
        List<User> technicians = userRepository.findByRoleAndIsActiveTrue(UserRole.TECHNICIAN);

        List<Map<String, Object>> result = technicians.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Active technicians list", result));
    }

    // ── Get all staff (non-patient) ────────────────────────────────────────────

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllStaff() {
        log.info("GET /api/admin/staff");
        List<UserRole> staffRoles = List.of(
            UserRole.TECHNICIAN, UserRole.MEDICAL_OFFICER, UserRole.ADMIN
        );
        List<User> staffUsers = userRepository.findAll().stream()
            .filter(u -> staffRoles.contains(u.getRole()))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = staffUsers.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("phone", u.getPhone());
            m.put("isActive", u.getIsActive());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Staff list", result));
    }
}
