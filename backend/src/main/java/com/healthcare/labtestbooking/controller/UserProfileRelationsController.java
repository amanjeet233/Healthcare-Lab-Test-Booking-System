package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.*;
import com.healthcare.labtestbooking.service.AddressService;
import com.healthcare.labtestbooking.service.FamilyMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class UserProfileRelationsController {

    private final FamilyMemberService familyMemberService;
    private final AddressService addressService;

    @GetMapping("/family-members")
    public ResponseEntity<ApiResponse<List<FamilyMemberResponse>>> getFamilyMembers() {
        return ResponseEntity.ok(ApiResponse.success("Family members retrieved successfully", familyMemberService.getFamilyMembers()));
    }

    @PostMapping("/family-members")
    public ResponseEntity<ApiResponse<FamilyMemberResponse>> addFamilyMember(@Valid @RequestBody FamilyMemberRequest request) {
        FamilyMemberResponse response = familyMemberService.addFamilyMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family member added successfully", response));
    }

    @PutMapping("/family-members/{memberId}")
    public ResponseEntity<ApiResponse<FamilyMemberResponse>> updateFamilyMember(
            @PathVariable Long memberId,
            @Valid @RequestBody FamilyMemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Family member updated successfully",
                familyMemberService.updateFamilyMember(memberId, request)));
    }

    @DeleteMapping("/family-members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(@PathVariable Long memberId) {
        familyMemberService.deleteFamilyMember(memberId);
        return ResponseEntity.ok(ApiResponse.success("Family member removed successfully", null));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getAddresses() {
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", addressService.getAllAddresses()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(@RequestBody AddressDTO request) {
        return ResponseEntity.ok(ApiResponse.success("Address saved successfully", addressService.saveAddress(request)));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressDTO request) {
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", addressService.updateAddress(id, request)));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
