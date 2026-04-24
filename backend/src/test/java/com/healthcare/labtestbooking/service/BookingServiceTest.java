package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private LabTestRepository labTestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private BookingService bookingService;

    private LabTest labTest;
    private User patient;
    private User technician;
    private Booking booking;
    private BookingRequest labCollectionRequest;
    private BookingRequest homeCollectionRequest;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(userDetails.getUsername()).thenReturn("patient@test.com");

        labTest = new LabTest();
        labTest.setId(1L);
        labTest.setTestName("Complete Blood Count");
        labTest.setPrice(new BigDecimal("500.00"));
        labTest.setIsActive(true);

        patient = new User();
        patient.setId(1L);
        patient.setName("Test Patient");
        patient.setEmail("patient@test.com");
        patient.setRole(UserRole.PATIENT);

        technician = new User();
        technician.setId(2L);
        technician.setName("Test Technician");
        technician.setRole(UserRole.TECHNICIAN);

        booking = new Booking();
        booking.setId(1L);
        booking.setBookingReference("BOOK123");
        booking.setPatient(patient);
        booking.setTest(labTest);
        booking.setBookingDate(LocalDate.now().plusDays(1));
        booking.setTimeSlot("09:00-10:00");
        booking.setStatus(BookingStatus.BOOKED);
        booking.setCollectionType(CollectionType.LAB);
        booking.setTotalAmount(new BigDecimal("500.00"));
        booking.setFinalAmount(new BigDecimal("500.00"));
        booking.setCreatedAt(LocalDateTime.now());

        labCollectionRequest = BookingRequest.builder()
            .testId(1L)
            .patientId(1L)
            .bookingDate(LocalDate.now().plusDays(1))
            .timeSlot("09:00-10:00")
            .collectionType("LAB")
            .build();

        homeCollectionRequest = BookingRequest.builder()
            .testId(1L)
            .patientId(1L)
            .bookingDate(LocalDate.now().plusDays(1))
            .timeSlot("09:00-10:00")
            .collectionType("HOME")
            .collectionAddress("123 Test Street, Test City")
            .build();

        lenient().when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(patient));
    }

    @Test
    void createBooking_Success_LabCollection() {
        // Given
        when(labTestRepository.findById(1L)).thenReturn(Optional.of(labTest));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        // When
        BookingResponse response = bookingService.createBooking(labCollectionRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getLabTestName()).isEqualTo("Complete Blood Count");
        assertThat(response.getPatientName()).isEqualTo("Test Patient");
        assertThat(response.getCollectionType()).isEqualTo(CollectionType.LAB.name());
        
        verify(labTestRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("patient@test.com");
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(notificationService, times(1)).sendBookingConfirmation(any(Booking.class));
    }

    @Test
    void createBooking_Success_HomeCollection() {
        // Given
        when(labTestRepository.findById(1L)).thenReturn(Optional.of(labTest));
        Booking homeBooking = new Booking();
        homeBooking.setId(2L);
        homeBooking.setBookingReference("BOOK456");
        homeBooking.setPatient(patient);
        homeBooking.setTest(labTest);
        homeBooking.setBookingDate(LocalDate.now().plusDays(1));
        homeBooking.setTimeSlot("09:00-10:00");
        homeBooking.setStatus(BookingStatus.BOOKED);
        homeBooking.setCollectionType(CollectionType.HOME);
        homeBooking.setCollectionAddress("123 Test Street, Test City");
        homeBooking.setHomeCollectionCharge(new BigDecimal("150.00"));
        homeBooking.setTotalAmount(new BigDecimal("650.00"));
        homeBooking.setFinalAmount(new BigDecimal("650.00"));
        homeBooking.setCreatedAt(LocalDateTime.now());
        when(bookingRepository.save(any(Booking.class))).thenReturn(homeBooking);

        // When
        BookingResponse response = bookingService.createBooking(homeCollectionRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getLabTestName()).isEqualTo("Complete Blood Count");
        assertThat(response.getPatientName()).isEqualTo("Test Patient");
        assertThat(response.getCollectionType()).isEqualTo(CollectionType.HOME.name());
        assertThat(response.getCollectionAddress()).isEqualTo("123 Test Street, Test City");
        
        verify(labTestRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("patient@test.com");
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(notificationService, times(1)).sendBookingConfirmation(any(Booking.class));
    }

    @Test
    void createBooking_TestNotFound_ThrowsException() {
        // Given
        when(labTestRepository.findById(999L)).thenReturn(Optional.empty());
        
        BookingRequest request = BookingRequest.builder()
            .testId(999L)
            .bookingDate(LocalDate.now().plusDays(1))
            .timeSlot("09:00-10:00")
            .build();

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.empty());
        
        BookingRequest request = BookingRequest.builder()
            .testId(1L)
            .bookingDate(LocalDate.now().plusDays(1))
            .timeSlot("09:00-10:00")
            .build();

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void getAvailableSlots_NoExistingBookings() {
        // Given
        String date = LocalDate.now().plusDays(1).toString();
        Long testId = 1L;
        when(bookingRepository.findByBookingDate(any(LocalDate.class))).thenReturn(Collections.emptyList());

        // When
        var availableSlots = bookingService.getAvailableSlots(date, testId);

        // Then
        assertThat(availableSlots).isNotNull();
        assertThat(availableSlots).isNotEmpty();
        verify(bookingRepository, times(1)).findByBookingDate(any(LocalDate.class));
    }

    @Test
    void getAvailableSlots_WithExistingBookings() {
        // Given
        String date = LocalDate.now().plusDays(1).toString();
        Long testId = 1L;
        Booking existingBooking = new Booking();
        existingBooking.setTimeSlot("09:00 AM");
        
        when(bookingRepository.findByBookingDate(any(LocalDate.class))).thenReturn(java.util.List.of(existingBooking));

        // When
        var availableSlots = bookingService.getAvailableSlots(date, testId);

        // Then
        assertThat(availableSlots).isNotNull();
        assertThat(availableSlots).doesNotContain("09:00 AM");
        verify(bookingRepository, times(1)).findByBookingDate(any(LocalDate.class));
    }

    @Test
    void assignTechnician_Success_LogsAudit() {
        User admin = new User();
        admin.setId(9L);
        admin.setEmail("admin@test.com");
        admin.setRole(UserRole.ADMIN);

        when(userDetails.getUsername()).thenReturn("admin@test.com");
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findById(2L)).thenReturn(Optional.of(technician));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse response = bookingService.assignTechnician(1L, 2L);

        assertThat(response.getTechnicianId()).isEqualTo(2L);
        assertThat(response.getTechnicianName()).isEqualTo("Test Technician");
        verify(auditService).logAction(
                eq(9L),
                eq("admin@test.com"),
                eq("ADMIN"),
                eq("TECHNICIAN_ASSIGNED"),
                eq("BOOKING"),
                eq("1"),
                contains("bookingId=1 technicianId=2"));
    }
}

