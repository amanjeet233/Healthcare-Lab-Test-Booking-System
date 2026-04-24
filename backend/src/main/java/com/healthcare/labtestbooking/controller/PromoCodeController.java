package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Coupon;
import com.healthcare.labtestbooking.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/promo-codes", "/api/promos"})
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class PromoCodeController {

    private final CouponRepository couponRepository;

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedPromoCodes(@RequestParam(defaultValue = "5") int limit) {
        List<Coupon> featured = couponRepository.findAll().stream()
                .filter(Coupon::getIsActive)
                .limit(limit)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", featured);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailablePromoCodes() {
        List<Coupon> available = couponRepository.findAll().stream()
                .filter(Coupon::getIsActive)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", available);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        
        return couponRepository.findByCouponCode(code)
                .map(coupon -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("code", coupon.getCouponCode());
                    data.put("discount_type", coupon.getDiscountType().name());
                    data.put("discount_value", coupon.getDiscountValue());
                    data.put("max_discount", coupon.getMaxDiscountAmount());
                    data.put("min_cart_value", coupon.getMinOrderAmount());
                    data.put("message", "Promo code applied!");

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", data);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Invalid promo code");
                    response.put("error", error);
                    return ResponseEntity.ok(response);
                });
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllPromoCodesForAdmin() {
        List<Map<String, Object>> rows = couponRepository.findAll().stream()
                .map(this::toPromoRow)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Promo codes fetched", rows));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPromoCode(@RequestBody Map<String, Object> body) {
        String code = stringVal(body.get("code")).trim();
        if (code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Promo code is required"));
        }
        if (couponRepository.existsByCouponCode(code)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Promo code already exists"));
        }

        Coupon coupon = new Coupon();
        coupon.setCouponCode(code.toUpperCase());
        applyPayload(coupon, body, false);
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success("Promo code created", toPromoRow(saved)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePromoCode(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));

        if (body.containsKey("code")) {
            String code = stringVal(body.get("code")).trim().toUpperCase();
            if (code.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Promo code is required"));
            }
            boolean duplicateCode = couponRepository.findByCouponCode(code)
                    .map(found -> !found.getCouponId().equals(id))
                    .orElse(false);
            if (duplicateCode) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Promo code already exists"));
            }
            coupon.setCouponCode(code);
        }

        applyPayload(coupon, body, true);
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success("Promo code updated", toPromoRow(saved)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deletePromoCode(@PathVariable Long id) {
        if (!couponRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Promo code not found"));
        }
        couponRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Promo code deleted", "OK"));
    }

    private void applyPayload(Coupon coupon, Map<String, Object> body, boolean isUpdate) {
        if (!isUpdate || body.containsKey("description")) {
            coupon.setDescription(stringOrNull(body.get("description")));
        }

        if (!isUpdate || body.containsKey("discountType")) {
            String discountType = stringVal(body.get("discountType"));
            if (!discountType.isBlank()) {
                coupon.setDiscountType("FLAT".equalsIgnoreCase(discountType)
                        ? Coupon.DiscountType.FIXED
                        : Coupon.DiscountType.valueOf(discountType.toUpperCase()));
            }
        }

        if (!isUpdate || body.containsKey("discountValue")) {
            BigDecimal value = decimalOrDefault(body.get("discountValue"), BigDecimal.ZERO);
            coupon.setDiscountValue(value);
        }

        if (!isUpdate || body.containsKey("minCartValue")) {
            coupon.setMinOrderAmount(decimalOrDefault(body.get("minCartValue"), BigDecimal.ZERO));
        }

        if (!isUpdate || body.containsKey("maxDiscount")) {
            coupon.setMaxDiscountAmount(decimalOrNull(body.get("maxDiscount")));
        }

        if (!isUpdate || body.containsKey("expiryDate")) {
            String expiryDate = stringVal(body.get("expiryDate"));
            coupon.setExpiryDate(expiryDate.isBlank() ? LocalDate.now().plusDays(30) : LocalDate.parse(expiryDate));
        }

        if (!isUpdate || body.containsKey("isActive")) {
            coupon.setIsActive(booleanOrDefault(body.get("isActive"), true));
        }

        if (!isUpdate && coupon.getCouponName() == null) {
            coupon.setCouponName(coupon.getCouponCode());
        }
        if (!isUpdate && coupon.getApplicableTo() == null) {
            coupon.setApplicableTo(Coupon.ApplicableTo.ALL);
        }
        if (!isUpdate && coupon.getCurrentUses() == null) {
            coupon.setCurrentUses(0);
        }
        if (!isUpdate && coupon.getMaxUsesPerUser() == null) {
            coupon.setMaxUsesPerUser(1);
        }
        if (!isUpdate && coupon.getMinOrderAmount() == null) {
            coupon.setMinOrderAmount(BigDecimal.ZERO);
        }
    }

    private Map<String, Object> toPromoRow(Coupon coupon) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", coupon.getCouponId());
        row.put("code", coupon.getCouponCode());
        row.put("description", coupon.getDescription());
        row.put("discount_type", coupon.getDiscountType() == Coupon.DiscountType.FIXED ? "FLAT" : coupon.getDiscountType().name());
        row.put("discount_value", coupon.getDiscountValue() != null ? coupon.getDiscountValue().doubleValue() : 0.0d);
        row.put("max_discount", coupon.getMaxDiscountAmount() != null ? coupon.getMaxDiscountAmount().doubleValue() : null);
        row.put("min_cart_value", coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount().doubleValue() : 0.0d);
        row.put("expiry_date", coupon.getExpiryDate() != null ? coupon.getExpiryDate().toString() : null);
        row.put("is_active", Boolean.TRUE.equals(coupon.getIsActive()));
        row.put("usage_limit", coupon.getMaxUses());
        row.put("used_count", coupon.getCurrentUses());
        row.put("created_at", coupon.getCreatedAt() != null ? coupon.getCreatedAt().toString() : null);
        row.put("updated_at", coupon.getUpdatedAt() != null ? coupon.getUpdatedAt().toString() : null);
        return row;
    }

    private String stringVal(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String stringOrNull(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }

    private boolean booleanOrDefault(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private BigDecimal decimalOrDefault(Object value, BigDecimal defaultValue) {
        BigDecimal parsed = decimalOrNull(value);
        return parsed != null ? parsed : defaultValue;
    }

    private BigDecimal decimalOrNull(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            String text = String.valueOf(value).trim();
            if (text.isEmpty()) {
                return null;
            }
            return new BigDecimal(text);
        } catch (Exception ex) {
            return null;
        }
    }
}
