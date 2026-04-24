package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.SlotConfigRequest;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.service.SlotConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slot-configs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Slot Configurations", description = "Management of daily appointment slot configurations")
public class SlotConfigController {

    private final SlotConfigService slotConfigService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create slot configuration", description = "Create a new slot configuration for a specific day (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Slot configuration created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid slot configuration data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<SlotConfig>> createConfig(@Valid @RequestBody SlotConfigRequest request) {
        log.info("Creating slot config for day: {}", request.getDayOfWeek());
        SlotConfig config = slotConfigService.createConfig(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot configuration created successfully", config));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update slot configuration", description = "Update an existing slot configuration (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Slot configuration updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid slot configuration data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Slot configuration not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<SlotConfig>> updateConfig(@PathVariable Long id, @Valid @RequestBody SlotConfigRequest request) {
        log.info("Updating slot config with id: {}", id);
        SlotConfig config = slotConfigService.updateConfig(id, request);
        return ResponseEntity.ok(ApiResponse.success("Slot configuration updated successfully", config));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all slot configurations")
    public ResponseEntity<ApiResponse<List<SlotConfig>>> getAllConfigs() {
        return ResponseEntity
                .ok(ApiResponse.success("Configs fetched successfully", slotConfigService.getAllConfigs()));
    }

    @GetMapping("/day/{dayOfWeek}")
    @Operation(summary = "Get configuration for a specific day")
    public ResponseEntity<ApiResponse<SlotConfig>> getByDay(@PathVariable String dayOfWeek) {
        return slotConfigService.getConfigByDay(dayOfWeek)
                .map(c -> ResponseEntity.ok(ApiResponse.success("Config found", c)))
                .orElse(ResponseEntity.notFound().build());
    }
}
