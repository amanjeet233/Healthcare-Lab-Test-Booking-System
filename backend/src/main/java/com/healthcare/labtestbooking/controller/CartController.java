package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.CartRequest.*;
import com.healthcare.labtestbooking.dto.CartResponse;
import com.healthcare.labtestbooking.dto.CartResponse.QuickCartInfo;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
@PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Shopping Cart", description = "Cart management for lab tests and packages")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    // ==================== Get Cart ====================

    @GetMapping
    @Operation(summary = "Get current user's cart", description = "Retrieves the active shopping cart with all items and pricing")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", response));
    }

    @GetMapping("/quick")
    @Operation(summary = "Get quick cart info", description = "Retrieves item count and total for header display")
    public ResponseEntity<ApiResponse<QuickCartInfo>> getQuickCartInfo(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        QuickCartInfo info = cartService.getQuickCartInfo(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart info retrieved", info));
    }

    // ==================== Add Items ====================

    @PostMapping("/add-test")
    @Operation(summary = "Add lab test to cart", description = "Adds a lab test with optional quantity")
    public ResponseEntity<ApiResponse<CartResponse>> addTestToCart(
            @Valid @RequestBody AddTestToCart request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Adding test {} to cart for user {}", request.getTestId(), userId);
        CartResponse response = cartService.addTestToCart(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Test added to cart", response), HttpStatus.CREATED);
    }

    @PostMapping("/add-package")
    @Operation(summary = "Add test package to cart", description = "Adds a test package to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> addPackageToCart(
            @Valid @RequestBody AddPackageToCart request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Adding package {} to cart for user {}", request.getPackageId(), userId);
        CartResponse response = cartService.addPackageToCart(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Package added to cart", response), HttpStatus.CREATED);
    }

    @PostMapping("/add-multiple-tests")
    @Operation(summary = "Add multiple tests to cart", description = "Adds multiple lab tests at once")
    public ResponseEntity<ApiResponse<CartResponse>> addMultipleTests(
            @Valid @RequestBody AddMultipleTests request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Adding {} tests to cart for user {}", request.getTestIds().size(), userId);
        CartResponse response = cartService.addMultipleTests(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Tests added to cart", response), HttpStatus.CREATED);
    }

    // ==================== Update Items ====================

    @PutMapping("/item/{cartItemId}")
    @Operation(summary = "Update cart item quantity", description = "Updates the quantity of a cart item")
    public ResponseEntity<ApiResponse<CartResponse>> updateQuantity(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateQuantity request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Updating cart item {} quantity to {} for user {}", cartItemId, request.getQuantity(), userId);
        CartResponse response = cartService.updateQuantity(userId, cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", response));
    }

    // ==================== Remove Items ====================

    @DeleteMapping("/item/{cartItemId}")
    @Operation(summary = "Remove item from cart", description = "Removes a specific item from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long cartItemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Removing cart item {} for user {}", cartItemId, userId);
        CartResponse response = cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", response));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear entire cart", description = "Removes all items from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Clearing cart for user {}", userId);
        CartResponse response = cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", response));
    }

    // ==================== Coupon Operations ====================

    @PostMapping("/coupon/apply")
    @Operation(summary = "Apply coupon to cart", description = "Applies a discount coupon to the cart")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(
            @Valid @RequestBody ApplyCoupon request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Applying coupon {} for user {}", request.getCouponCode(), userId);
        CartResponse response = cartService.applyCoupon(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", response));
    }

    @DeleteMapping("/coupon/remove")
    @Operation(summary = "Remove coupon from cart", description = "Removes the applied coupon from the cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        log.info("Removing coupon for user {}", userId);
        CartResponse response = cartService.removeCoupon(userId);
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", response));
    }

    // ==================== Validation Endpoints ====================

    @GetMapping("/check/test/{testId}")
    @Operation(summary = "Check if test is in cart", description = "Returns true if the test is already in the cart")
    public ResponseEntity<ApiResponse<Boolean>> isTestInCart(
            @PathVariable Long testId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean inCart = cartService.isTestInCart(userId, testId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", inCart));
    }

    @GetMapping("/check/package/{packageId}")
    @Operation(summary = "Check if package is in cart", description = "Returns true if the package is already in the cart")
    public ResponseEntity<ApiResponse<Boolean>> isPackageInCart(
            @PathVariable Long packageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean inCart = cartService.isPackageInCart(userId, packageId);
        return ResponseEntity.ok(ApiResponse.success("Check completed", inCart));
    }

    // ==================== Helper Methods ====================

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
