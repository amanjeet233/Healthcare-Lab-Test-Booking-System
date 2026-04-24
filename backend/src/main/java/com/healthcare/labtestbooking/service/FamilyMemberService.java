package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.FamilyMemberRequest;
import com.healthcare.labtestbooking.dto.FamilyMemberResponse;
import com.healthcare.labtestbooking.entity.FamilyMember;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.FamilyMemberRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public FamilyMemberResponse addFamilyMember(FamilyMemberRequest request) {
        User currentUser = getCurrentUser();
        
        FamilyMember familyMember = FamilyMember.builder()
                .patient(currentUser)
                .name(request.getName())
                .relation(request.getRelation())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .medicalHistory(request.getMedicalHistory())
                .build();
                
        familyMember = familyMemberRepository.save(Objects.requireNonNull(familyMember, "FamilyMember must not be null"));
        return mapToResponse(familyMember);
    }

    public List<FamilyMemberResponse> getFamilyMembers() {
        User currentUser = getCurrentUser();
        return familyMemberRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FamilyMemberResponse updateFamilyMember(Long id, FamilyMemberRequest request) {
        User currentUser = getCurrentUser();
        FamilyMember familyMember = familyMemberRepository.findById(Objects.requireNonNull(id, "Family member ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Family member not found"));

        if (!familyMember.getPatient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to update this family member");
        }

        familyMember.setName(request.getName());
        familyMember.setRelation(request.getRelation());
        familyMember.setDateOfBirth(request.getDateOfBirth());
        familyMember.setGender(request.getGender());
        familyMember.setBloodGroup(request.getBloodGroup());
        familyMember.setPhoneNumber(request.getPhoneNumber());
        familyMember.setEmail(request.getEmail());
        familyMember.setMedicalHistory(request.getMedicalHistory());

        familyMember = familyMemberRepository.save(familyMember);
        return mapToResponse(familyMember);
    }

    @Transactional
    public void deleteFamilyMember(Long id) {
        User currentUser = getCurrentUser();
        FamilyMember familyMember = familyMemberRepository.findById(Objects.requireNonNull(id, "Family member ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Family member not found"));

        if (!familyMember.getPatient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to delete this family member");
        }

        familyMemberRepository.delete(familyMember);
    }

    private FamilyMemberResponse mapToResponse(FamilyMember familyMember) {
        String resolvedName = familyMember.getName();
        if (resolvedName == null || resolvedName.isBlank()) {
            resolvedName = familyMember.getFirstName();
        }

        return FamilyMemberResponse.builder()
                .id(familyMember.getId())
                .name(resolvedName)
                .relation(familyMember.getRelation())
                .dateOfBirth(familyMember.getDateOfBirth())
                .gender(familyMember.getGender())
                .bloodGroup(familyMember.getBloodGroup())
                .phoneNumber(familyMember.getPhoneNumber())
                .email(familyMember.getEmail())
                .medicalHistory(familyMember.getMedicalHistory())
                .patientId(familyMember.getPatient().getId())
                .build();
    }
}
