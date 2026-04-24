package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BookingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void findByBookingReference_ReturnsBooking_WhenExists() {
        // Given
        User patient = createUser("patient@test.com", "Test Patient", UserRole.PATIENT);
        entityManager.persist(patient);

        LabTest test = createLabTest("Blood Test");
        entityManager.persist(test);
        
        Booking booking = createBooking("BK-TEST123", patient, test);
        entityManager.persistAndFlush(booking);

        // When
        Optional<Booking> foundBooking = bookingRepository.findByBookingReference("BK-TEST123");

        // Then
        assertThat(foundBooking).isPresent();
        assertThat(foundBooking.get().getBookingReference()).isEqualTo("BK-TEST123");
        assertThat(foundBooking.get().getPatient()).isNotNull();
    }

    @Test
    void findByBookingReference_ReturnsEmpty_WhenNotExists() {
        // When
        Optional<Booking> foundBooking = bookingRepository.findByBookingReference("NONEXISTENT");

        // Then
        assertThat(foundBooking).isEmpty();
    }

    @Test
    void findByPatientId_ReturnsBookings_ForPatient() {
        // Given
        User patient = createUser("patient@example.com", "Patient", UserRole.PATIENT);
        entityManager.persist(patient);

        LabTest test = createLabTest("Blood Test");
        entityManager.persist(test);

        Booking booking1 = createBooking("BK-001", patient, test);
        Booking booking2 = createBooking("BK-002", patient, test);

        entityManager.persist(booking1);
        entityManager.persist(booking2);
        entityManager.flush();

        // When
        List<Booking> bookings = bookingRepository.findByPatientId(patient.getId());

        // Then
        assertThat(bookings).hasSize(2);
        assertThat(bookings).extracting(Booking::getBookingReference)
                .containsExactlyInAnyOrder("BK-001", "BK-002");
    }

    @Test
    void findByPatientId_ReturnsEmpty_WhenNoBookings() {
        // Given
        User patient = createUser("patient@example.com", "Patient", UserRole.PATIENT);
        entityManager.persistAndFlush(patient);

        // When
        List<Booking> bookings = bookingRepository.findByPatientId(patient.getId());

        // Then
        assertThat(bookings).isEmpty();
    }

    @Test
    void findByTestId_ReturnsBookings_ForTest() {
        // Given
        User patient = createUser("patient@test.com", "Test Patient", UserRole.PATIENT);
        entityManager.persist(patient);
        
        LabTest test = createLabTest("Complete Blood Count");
        entityManager.persist(test);

        Booking booking1 = createBooking("BK-001", patient, test);
        Booking booking2 = createBooking("BK-002", patient, test);

        entityManager.persist(booking1);
        entityManager.persist(booking2);
        entityManager.flush();

        // When
        List<Booking> bookings = bookingRepository.findByTestId(test.getId());

        // Then
        assertThat(bookings).hasSize(2);
        assertThat(bookings).extracting(Booking::getBookingReference)
                .containsExactlyInAnyOrder("BK-001", "BK-002");
    }

    @Test
    void findByStatus_ReturnsBookings_WithStatus() {
        // Given
        User patient = createUser("patient@test.com", "Test Patient", UserRole.PATIENT);
        entityManager.persist(patient);

        LabTest test = createLabTest("Blood Test");
        entityManager.persist(test);
        
        Booking bookedBooking = createBooking("BK-BOOKED", patient, test);
        bookedBooking.setStatus(BookingStatus.BOOKED);

        Booking completedBooking = createBooking("BK-COMPLETED", patient, test);
        completedBooking.setStatus(BookingStatus.COMPLETED);

        entityManager.persist(bookedBooking);
        entityManager.persist(completedBooking);
        entityManager.flush();

        // When
        List<Booking> bookedBookings = bookingRepository.findByStatus(BookingStatus.BOOKED);

        // Then
        assertThat(bookedBookings).hasSize(1);
        assertThat(bookedBookings.get(0).getBookingReference()).isEqualTo("BK-BOOKED");
    }

    @Test
    void findByPatientIdAndStatus_ReturnsFilteredBookings() {
        // Given
        User patient = createUser("patient@example.com", "Patient", UserRole.PATIENT);
        entityManager.persist(patient);

        LabTest test = createLabTest("Blood Test");
        entityManager.persist(test);

        Booking booking1 = createBooking("BK-001", patient, test);
        booking1.setStatus(BookingStatus.BOOKED);

        Booking booking2 = createBooking("BK-002", patient, test);
        booking2.setStatus(BookingStatus.COMPLETED);

        User otherPatient = createUser("other@example.com", "Other", UserRole.PATIENT);
        entityManager.persist(otherPatient);
        Booking booking3 = createBooking("BK-003", otherPatient, test);
        booking3.setStatus(BookingStatus.BOOKED);

        entityManager.persist(booking1);
        entityManager.persist(booking2);
        entityManager.persist(booking3);
        entityManager.flush();

        // When
        List<Booking> result = bookingRepository.findByPatientIdAndStatus(patient.getId(), BookingStatus.BOOKED);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBookingReference()).isEqualTo("BK-001");
    }

    @Test
    void findByBookingDate_ReturnsBookings_OnDate() {
        // Given
        User patient = createUser("patient@test.com", "Test Patient", UserRole.PATIENT);
        entityManager.persist(patient);

        LabTest test = createLabTest("Blood Test");
        entityManager.persist(test);
        
        LocalDate targetDate = LocalDate.now().plusDays(1);
        LocalDate otherDate = LocalDate.now().plusDays(2);

        Booking booking1 = createBooking("BK-001", patient, test);
        booking1.setBookingDate(targetDate);

        Booking booking2 = createBooking("BK-002", patient, test);
        booking2.setBookingDate(targetDate);

        Booking booking3 = createBooking("BK-003", patient, test);
        booking3.setBookingDate(otherDate);

        entityManager.persist(booking1);
        entityManager.persist(booking2);
        entityManager.persist(booking3);
        entityManager.flush();

        // When
        List<Booking> bookings = bookingRepository.findByBookingDate(targetDate);

        // Then
        assertThat(bookings).hasSize(2);
        assertThat(bookings).extracting(Booking::getBookingReference)
                .containsExactlyInAnyOrder("BK-001", "BK-002");
    }

    // Helper methods
    private Booking createBooking(String reference, User patient, LabTest test) {
        Booking booking = new Booking();
        booking.setBookingReference(reference);
        booking.setPatient(patient);
        booking.setTest(test);
        booking.setBookingDate(LocalDate.now().plusDays(1));
        booking.setTimeSlot("09:00-10:00");
        booking.setStatus(BookingStatus.BOOKED);
        booking.setCollectionType(CollectionType.LAB);
        booking.setTotalAmount(new BigDecimal("500.00"));
        booking.setFinalAmount(new BigDecimal("500.00"));
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        return booking;
    }

    private User createUser(String email, String name, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setPassword("encodedPassword");
        user.setIsActive(true);
        return user;
    }

    private LabTest createLabTest(String name) {
        LabTest test = new LabTest();
        test.setTestName(name);
        test.setPrice(new BigDecimal("500.00"));
        test.setIsActive(true);
        return test;
    }
}