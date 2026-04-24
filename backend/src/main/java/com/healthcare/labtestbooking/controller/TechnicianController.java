package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.service.TechnicianAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Technician Management", description = "Technician assignment and location tracking")
@SecurityRequirement(name = "bearerAuth")
public class TechnicianController {

    private final TechnicianAssignmentService technicianAssignmentService;

    @GetMapping("/available")
    @Operation(summary = "Get available technicians", description = "Get available technicians for a specific date and pincode")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technicians retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date or pincode"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAvailableTechnicians(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String pincode,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("GET /api/technicians/available - date: {}, pincode: {}", date, pincode);
        List<Map<String, Object>> technicians = technicianAssignmentService.getAvailableTechnicians(date, pincode);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), technicians.size());
        List<Map<String, Object>> content = start >= technicians.size()
                ? List.of()
                : technicians.subList(start, end);
        Page<Map<String, Object>> page = new PageImpl<>(content, pageable, technicians.size());
        return ResponseEntity.ok(ApiResponse.success("Found " + technicians.size() + " available technicians", page));
    }
}
