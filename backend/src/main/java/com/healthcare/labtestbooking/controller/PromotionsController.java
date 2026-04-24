package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Coupon;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class PromotionsController {

    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPromotions(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "discount") String sort) {
        LocalDate today = LocalDate.now();
        List<Coupon> coupons = couponRepository.findAllActiveCoupons(today);

        // Category-specific coupon metadata is not present in current Coupon entity.
        // Keep API contract stable by accepting the query param and ignoring it.

        if ("discount".equalsIgnoreCase(sort)) {
            coupons = coupons.stream()
                    .sorted(Comparator.comparing(Coupon::getDiscountValue, Comparator.nullsLast(Comparator.reverseOrder())))
                    .collect(Collectors.toList());
        } else if ("expiry".equalsIgnoreCase(sort)) {
            coupons = coupons.stream()
                    .sorted(Comparator.comparing(Coupon::getExpiryDate, Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> mapped = coupons.stream().map(coupon -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", coupon.getCouponId());
            row.put("code", coupon.getCouponCode());
            row.put("title", coupon.getCouponName() != null ? coupon.getCouponName() : coupon.getCouponCode());
            row.put("description", coupon.getDescription());
            row.put("discountType", coupon.getDiscountType().name().toLowerCase());
            row.put("discountValue", coupon.getDiscountValue());
            row.put("minOrderValue", coupon.getMinOrderAmount());
            row.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
            row.put("validUntil", coupon.getExpiryDate());
            row.put("imageUrl", null);
            row.put("category", null);
            return row;
        }).collect(Collectors.toList());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("promotions", mapped);
        payload.put("total", mapped.size());
        return ResponseEntity.ok(ApiResponse.success("Promotions fetched successfully", payload));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyPromotion(@RequestBody Map<String, Object> request) {
        String code = request.get("code") != null ? String.valueOf(request.get("code")).trim() : null;
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Promo code is required"));
        }

        Coupon coupon = couponRepository.findByCouponCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Invalid promo code"));

        BigDecimal orderAmount = extractOrderAmount(request);
        if (orderAmount == null) {
            Long bookingId = extractLong(request.get("bookingId"));
            if (bookingId != null) {
                Booking booking = bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new RuntimeException("Booking not found"));
                orderAmount = booking.getFinalAmount();
            }
        }

        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("orderAmount or valid bookingId is required"));
        }

        BigDecimal discountAmount = coupon.calculateDiscount(orderAmount);
        BigDecimal newTotal = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        return ResponseEntity.ok(ApiResponse.success("Promotion applied successfully", Map.of(
                "promotion", Map.of(
                        "code", coupon.getCouponCode(),
                        "discountAmount", discountAmount,
                        "discountType", coupon.getDiscountType().name(),
                        "discountValue", coupon.getDiscountValue()
                ),
                "originalTotal", orderAmount,
                "newTotal", newTotal
        )));
    }

    private BigDecimal extractOrderAmount(Map<String, Object> request) {
        Object amount = request.get("orderAmount");
        if (amount == null) return null;
        if (amount instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(String.valueOf(amount));
        } catch (Exception ex) {
            return null;
        }
    }

    private Long extractLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ex) {
            return null;
        }
    }
}
