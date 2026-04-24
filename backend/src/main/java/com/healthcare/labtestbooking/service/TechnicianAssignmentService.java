package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Technician;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TechnicianAssignmentService {

    private final TechnicianRepository technicianRepository;
    private final BookingRepository bookingRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    public List<Map<String, Object>> getAvailableTechnicians(LocalDate date, String pincode) {
        log.info("Finding available technicians for date: {} and pincode: {}", date, pincode);
        List<Technician> technicians = technicianRepository.findDistinctByIsActiveTrueAndServicePincodesContaining(pincode);
        LocalTime now = LocalTime.now();
        List<Map<String, Object>> availableTechs = new ArrayList<>();

        for (Technician tech : technicians) {
            if (tech.getWorkingStart() != null && tech.getWorkingEnd() != null) {
                if (date.equals(LocalDate.now())) {
                    if (now.isBefore(tech.getWorkingStart()) || now.isAfter(tech.getWorkingEnd())) {
                        continue;
                    }
                }
            }
            Map<String, Object> techInfo = new LinkedHashMap<>();
            techInfo.put("technicianId", tech.getId());
            techInfo.put("name", tech.getFullName());
            techInfo.put("phone", tech.getPhone());
            techInfo.put("email", tech.getEmail());
            techInfo.put("qualifications", tech.getQualifications());
            techInfo.put("skills", tech.getSkills());
            techInfo.put("servicePincodes", tech.getServicePincodes());
            techInfo.put("workingHours", formatWorkingHours(tech));
            techInfo.put("currentLocation", formatLocation(tech));
            techInfo.put("lastLocationUpdate", tech.getLastLocationUpdate());
            availableTechs.add(techInfo);
        }
        log.info("Found {} available technicians for pincode {}", availableTechs.size(), pincode);
        return availableTechs;
    }

    @Transactional
    public Map<String, Object> autoAssignTechnician(Long bookingId) {
        log.info("Auto-assigning technician to booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (booking.getTechnician() != null) {
            throw new RuntimeException("Booking already has a technician assigned");
        }
        List<Technician> technicians = technicianRepository.findByIsActiveTrue();
        if (technicians.isEmpty()) {
            throw new RuntimeException("No technicians available");
        }
        Technician nearestTech = null;
        LocalTime now = LocalTime.now();
        for (Technician tech : technicians) {
            if (tech.getWorkingStart() != null && tech.getWorkingEnd() != null) {
                if (!now.isBefore(tech.getWorkingStart()) && !now.isAfter(tech.getWorkingEnd())) {
                    if (nearestTech == null) {
                        nearestTech = tech;
                    }
                }
            } else if (nearestTech == null) {
                nearestTech = tech;
            }
        }
        if (nearestTech == null) {
            nearestTech = technicians.get(0);
        }
        User techUser = nearestTech.getUser();
        booking.setTechnician(techUser);
        bookingRepository.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingId", bookingId);
        result.put("technicianId", nearestTech.getId());
        result.put("technicianUserId", techUser.getId());
        result.put("name", nearestTech.getFullName());
        result.put("phone", nearestTech.getPhone());
        result.put("estimatedArrival", LocalTime.now().plusMinutes(30).toString());
        result.put("assignedAt", LocalDateTime.now());
        result.put("status", "ASSIGNED");
        log.info("Technician {} assigned to booking {}", nearestTech.getId(), bookingId);
        return result;
    }

    @Transactional
    public Map<String, Object> reassignTechnician(Long bookingId, Long newTechnicianId) {
        log.info("Reassigning technician {} to booking {}", newTechnicianId, bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        Technician newTech = technicianRepository.findById(newTechnicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + newTechnicianId));
        if (!newTech.getIsActive()) {
            throw new RuntimeException("Technician is not active");
        }
        User previousTech = booking.getTechnician();
        booking.setTechnician(newTech.getUser());
        bookingRepository.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingId", bookingId);
        result.put("previousTechnicianId", previousTech != null ? previousTech.getId() : null);
        result.put("newTechnicianId", newTech.getId());
        result.put("name", newTech.getFullName());
        result.put("phone", newTech.getPhone());
        result.put("reassignedAt", LocalDateTime.now());
        result.put("status", "REASSIGNED");
        log.info("Booking {} reassigned to {}", bookingId, newTech.getId());
        return result;
    }

    public Map<String, Object> getTechnicianLocation(Long technicianId) {
        log.info("Getting location for technician: {}", technicianId);
        Technician tech = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianId));
        Map<String, Object> location = new LinkedHashMap<>();
        location.put("technicianId", tech.getId());
        location.put("name", tech.getFullName());
        location.put("latitude", tech.getCurrentLat());
        location.put("longitude", tech.getCurrentLng());
        location.put("lastUpdate", tech.getLastLocationUpdate());
        location.put("isActive", tech.getIsActive());
        location.put("workingHours", formatWorkingHours(tech));
        location.put("locationAvailable", tech.getCurrentLat() != null && tech.getCurrentLng() != null);
        return location;
    }

    private String formatWorkingHours(Technician tech) {
        if (tech.getWorkingStart() != null && tech.getWorkingEnd() != null) {
            return tech.getWorkingStart().toString() + " - " + tech.getWorkingEnd().toString();
        }
        return "Not specified";
    }

    private Map<String, Object> formatLocation(Technician tech) {
        Map<String, Object> loc = new HashMap<>();
        loc.put("lat", tech.getCurrentLat());
        loc.put("lng", tech.getCurrentLng());
        return loc;
    }

    /**
     * Returns all active technicians with their booking count for a given date,
     * so Medical Officers can make load-balanced assignment decisions.
     */
    public List<Map<String, Object>> getTechniciansWithLoadForDate(LocalDate date) {
        log.info("Getting technicians with load for date: {}", date);

        Map<Long, Long> countByTechUserId = bookingRepository
                .countBookingsByTechnicianForDate(date)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return technicianRepository.findByIsActiveTrue().stream().map(tech -> {
            Long userId = tech.getUser() != null ? tech.getUser().getId() : null;
            long count = userId != null ? countByTechUserId.getOrDefault(userId, 0L) : 0L;
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("technicianId", tech.getId());
            info.put("userId", userId);
            info.put("name", tech.getFullName());
            info.put("phone", tech.getPhone());
            info.put("email", tech.getEmail());
            info.put("qualifications", tech.getQualifications());
            info.put("workingHours", formatWorkingHours(tech));
            info.put("bookingCountForDate", count);
            return info;
        }).collect(Collectors.toList());
    }
}
