package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final LabTestRepository labTestRepository;

    public Map<String, Object> getPatientDashboardStats() {
        User patient = getCurrentUser();
        Map<String, Object> stats = new HashMap<>();
        
        List<Booking> bookings = bookingRepository.findByPatientId(patient.getId());
        
        stats.put("totalBookings", bookings.size());
        stats.put("completedBookings", bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count());
        stats.put("upcomingBookings", bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.CONFIRMED)
                .count());
        stats.put("pendingReports", bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PROCESSING)
                .count());
        stats.put("recentBookings", bookings.stream()
                .limit(5)
                .toList());
        
        return stats;
    }

    public Map<String, Object> getTechnicianDashboardStats() {
        User technician = getCurrentUser();
        Map<String, Object> stats = new HashMap<>();
        
        List<Booking> bookings = bookingRepository.findByTechnicianId(technician.getId());
        java.time.LocalDate today = java.time.LocalDate.now();
        
        stats.put("totalAssignedBookings", bookings.size());
        stats.put("totalAssigned", bookings.size());
        stats.put("todayBookings", bookings.stream()
                .filter(b -> today.equals(b.getBookingDate()))
                .count());
        stats.put("completedToday", bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.SAMPLE_COLLECTED
                             && today.equals(b.getBookingDate()))
                .count());
        stats.put("pendingCollection", bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.CONFIRMED)
                .count());
        
        return stats;
    }

    public Map<String, Object> getMedicalOfficerDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long pendingVerifications = bookingRepository.countByStatus(BookingStatus.PENDING_VERIFICATION);
        long processingReports = bookingRepository.countByStatus(BookingStatus.PROCESSING);
        long completedReports = bookingRepository.countByStatusIn(Arrays.asList(
                BookingStatus.VERIFIED,
                BookingStatus.COMPLETED
        ));
        long criticalAlerts = bookingRepository.countByCriticalFlagTrueAndStatusNot(BookingStatus.COMPLETED);
        
        stats.put("pendingVerifications", pendingVerifications);
        stats.put("processingReports", processingReports);
        stats.put("criticalAlerts", criticalAlerts);
        stats.put("totalVerified", completedReports);
        
        return stats;
    }

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
                long totalBookings = bookingRepository.countByStatusNot(BookingStatus.CANCELLED);
        long totalUsers = userRepository.count();
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long activeUsers = userRepository.findByIsActiveTrue().size();
        
        stats.put("totalBookings", totalBookings);
        stats.put("totalUsers", totalUsers);
        stats.put("completedBookings", completedBookings);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingBookings", bookingRepository.countByStatusIn(java.util.Arrays.asList(
                BookingStatus.BOOKED,
                BookingStatus.CONFIRMED,
                BookingStatus.REFLEX_PENDING
        )));
        stats.put("processingBookings", bookingRepository.countByStatus(BookingStatus.PROCESSING));
        stats.put("todayBookings", bookingRepository.countByBookingDate(java.time.LocalDate.now()));
        stats.put("criticalCount", bookingRepository.countByCriticalFlagTrueAndStatusNot(BookingStatus.COMPLETED));
        
        java.math.BigDecimal revenue = bookingRepository.sumTotalBookedRevenue();

        stats.put("totalRevenue", revenue != null ? revenue.doubleValue() : 0.0d);
        stats.put("totalTests", labTestRepository.count());
        
        return stats;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
