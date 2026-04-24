package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.FamilyMemberRequest;
import com.healthcare.labtestbooking.dto.FamilyMemberResponse;
import com.healthcare.labtestbooking.service.FamilyMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/family-members")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Family Members", description = "Endpoints for managing family members")
@SecurityRequirement(name = "bearerAuth")
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    @PostMapping
    @Operation(summary = "Add family member", description = "Add a new family member for the authenticated user")
    public ResponseEntity<ApiResponse<FamilyMemberResponse>> addFamilyMember(@Valid @RequestBody FamilyMemberRequest request) {
        log.info("Add family member request: {}", request);
        FamilyMemberResponse response = familyMemberService.addFamilyMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family member added successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get family members", description = "Get all family members of the authenticated user")
    public ResponseEntity<ApiResponse<List<FamilyMemberResponse>>> getFamilyMembers() {
        log.info("Get family members request");
        List<FamilyMemberResponse> members = familyMemberService.getFamilyMembers();
        return ResponseEntity.ok(ApiResponse.success("Family members retrieved successfully", members));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete family member", description = "Delete a family member by ID")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(@PathVariable Long id) {
        log.info("Delete family member request for id: {}", id);
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.ok(ApiResponse.success("Family member deleted successfully", null));
    }
}


