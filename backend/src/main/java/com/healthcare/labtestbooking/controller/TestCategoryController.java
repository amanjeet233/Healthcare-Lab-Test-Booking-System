package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.service.TestCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-categories")
@RequiredArgsConstructor
@Tag(name = "Test Categories", description = "Management of lab test categories")
public class TestCategoryController {

    private final TestCategoryService testCategoryService;

    @GetMapping
    @Operation(summary = "Get all test categories")
    public ResponseEntity<ApiResponse<List<TestCategory>>> getAllCategories() {
        return ResponseEntity
                .ok(ApiResponse.success("Categories fetched successfully", testCategoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test category by ID")
    public ResponseEntity<ApiResponse<TestCategory>> getCategoryById(@PathVariable Long id) {
        return testCategoryService.getCategoryById(id)
                .map(c -> ResponseEntity.ok(ApiResponse.success("Category found", c)))
                .orElse(ResponseEntity.notFound().build());
    }
}
