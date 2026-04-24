package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.DoctorTest;
import com.healthcare.labtestbooking.service.DoctorTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-tests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Doctor Test Assignment", description = "APIs for managing doctor-test assignments")
@PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
public class DoctorTestAssignmentController {

    private final DoctorTestService doctorTestService;

    @GetMapping
    @Operation(summary = "Get all doctor-test assignments")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAssignments(
            @RequestParam(required = false) Long doctorId) {
        
        List<DoctorTest> assignments;
        if (doctorId != null) {
            assignments = doctorTestService.getAssignmentsByDoctor(doctorId);
        } else {
            assignments = doctorTestService.getAllAssignments();
        }

        List<Map<String, Object>> result = assignments.stream().map(a -> {
            Map<String, Object> m = Map.of(
                "id", a.getId(),
                "doctorId", a.getDoctor().getId(),
                "doctorName", a.getDoctor().getName(),
                "testId", a.getTest().getId(),
                "testName", a.getTest().getTestName(),
                "assignedAt", a.getAssignedAt()
            );
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Assignments fetched successfully", result));
    }

    @PostMapping
    @Operation(summary = "Assign a test to a doctor")
    public ResponseEntity<ApiResponse<DoctorTest>> assignTest(@RequestBody Map<String, Long> body) {
        Long doctorId = body.get("doctorId");
        Long testId = body.get("testId");
        
        if (doctorId == null || testId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("doctorId and testId are required"));
        }

        DoctorTest assignment = doctorTestService.assignTest(doctorId, testId);
        return ResponseEntity.ok(ApiResponse.success("Test assigned successfully", assignment));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a doctor-test assignment")
    public ResponseEntity<ApiResponse<Void>> removeAssignment(@PathVariable Long id) {
        doctorTestService.removeAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment removed successfully", null));
    }
}
