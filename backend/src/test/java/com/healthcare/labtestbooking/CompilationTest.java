package com.healthcare.labtestbooking;

import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class CompilationTest {

    @Test
    public void testReportVerificationEntity() {
        // Test that ReportVerification entity can be created and has all required
        // methods
        ReportVerification verification = new ReportVerification();

        // Test setters
        verification.setId(1L);
        verification.setClinicalNotes("Test notes");
        verification.setDigitalSignature("signature123");
        verification.setIcdCodes("A01,B02");
        // verification.setRequiresSpecialistReferral(true);
        verification.setSpecialistType("Cardiologist");
        verification.setStatus(VerificationStatus.APPROVED);
        verification.setVerificationDate(LocalDateTime.now());

        // Test getters
        assertEquals(1L, verification.getId());
        assertEquals("Test notes", verification.getClinicalNotes());
        assertEquals("signature123", verification.getDigitalSignature());
        assertEquals("A01,B02", verification.getIcdCodes());
        // assertTrue(verification.getRequiresSpecialistReferral());
        assertEquals("Cardiologist", verification.getSpecialistType());
        assertEquals(VerificationStatus.APPROVED, verification.getStatus());
        assertNotNull(verification.getVerificationDate());

        // Test builder
        ReportVerification built = ReportVerification.builder()
                .clinicalNotes("Built notes")
                .status(VerificationStatus.PENDING)
                .build();

        assertEquals("Built notes", built.getClinicalNotes());
        assertEquals(VerificationStatus.PENDING, built.getStatus());
    }

    @Test
    public void testReportVerificationRequest() {
        // Test that ReportVerificationRequest DTO works
        ReportVerificationRequest request = new ReportVerificationRequest();
        request.setClinicalNotes("Clinical notes");
        request.setDigitalSignature("signature");
        request.setApproved(true);
        request.setIcdCodes("C01,D02");
        // request.setRequiresSpecialistReferral(false);
        request.setSpecialistType("Neurologist");

        assertEquals("Clinical notes", request.getClinicalNotes());
        assertEquals("signature", request.getDigitalSignature());
        assertTrue(request.getApproved());
        assertEquals("C01,D02", request.getIcdCodes());
        // assertFalse(request.getRequiresSpecialistReferral());
        assertEquals("Neurologist", request.getSpecialistType());
    }

    @Test
    public void testReportVerificationResponse() {
        // Test that ReportVerificationResponse DTO works
        ReportVerificationResponse response = new ReportVerificationResponse();
        response.setId(1L);
        response.setBookingId(100L);
        response.setMedicalOfficerName("Dr. Smith");
        response.setStatus("APPROVED");
        response.setClinicalNotes("Test notes");
        response.setDigitalSignature("signature123");
        response.setVerificationDate(LocalDateTime.now());
        response.setIcdCodes("A01,B02");
        // response.setRequiresSpecialistReferral(true);
        response.setSpecialistType("Cardiologist");
        response.setCreatedAt(LocalDateTime.now());
        response.setUpdatedAt(LocalDateTime.now());

        assertEquals(1L, response.getId());
        assertEquals(100L, response.getBookingId());
        assertEquals("Dr. Smith", response.getMedicalOfficerName());
        assertEquals("APPROVED", response.getStatus());
        assertEquals("Test notes", response.getClinicalNotes());
        assertEquals("signature123", response.getDigitalSignature());
        assertNotNull(response.getVerificationDate());
        assertEquals("A01,B02", response.getIcdCodes());
        // assertTrue(response.getRequiresSpecialistReferral());
        assertEquals("Cardiologist", response.getSpecialistType());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getUpdatedAt());
    }

    @Test
    public void testVerificationStatusEnum() {
        // Test that VerificationStatus enum has all required values
        assertEquals(4, VerificationStatus.values().length);
        assertNotNull(VerificationStatus.PENDING);
        assertNotNull(VerificationStatus.APPROVED);
        assertNotNull(VerificationStatus.REJECTED);
        assertNotNull(VerificationStatus.FLAGGED);
    }
}