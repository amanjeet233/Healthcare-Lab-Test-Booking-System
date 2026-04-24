package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.CartRequest.*;
import com.healthcare.labtestbooking.dto.CartResponse;
import com.healthcare.labtestbooking.dto.CartResponse.*;
import com.healthcare.labtestbooking.entity.*;
import com.healthcare.labtestbooking.entity.Cart.CartStatus;
import com.healthcare.labtestbooking.entity.CartItem.ItemType;
import com.healthcare.labtestbooking.exception.*;
import com.healthcare.labtestbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final LabTestRepository labTestRepository;
    private final TestPackageRepository testPackageRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    // Tax rate (GST 18%)
    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");

    // ==================== Cart Operations ====================

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    public QuickCartInfo getQuickCartInfo(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);
        if (cart == null) {
            return QuickCartInfo.builder()
                    .itemCount(0)
                    .totalPrice(BigDecimal.ZERO)
                    .build();
        }
        return QuickCartInfo.builder()
                .cartId(cart.getCartId())
                .itemCount(cart.getItemCount())
                .totalPrice(cart.getTotalPrice())
                .build();
    }

    public Cart getOrCreateCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);
        
        if (cart != null && cart.getExpiryAt() != null && cart.getExpiryAt().isBefore(LocalDateTime.now())) {
            log.info("Active cart for user {} has expired. Marking as EXPIRED.", userId);
            cart.setStatus(CartStatus.EXPIRED);
            cartRepository.save(cart);
            cart = null; // Forces creation of a new cart below
        }

        return cart != null ? cart : createNewCart(userId);
    }

    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "User ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = Cart.builder()
                .user(user)
                .status(CartStatus.ACTIVE)
                .expiryAt(LocalDateTime.now().plusDays(30))
                .build();

        return cartRepository.save(Objects.requireNonNull(cart, "Cart must not be null"));
    }

    // ==================== Add Items ====================

    public CartResponse addTestToCart(Long userId, AddTestToCart request) {
        Cart cart = getOrCreateCart(userId);

        LabTest test = labTestRepository.findById(Objects.requireNonNull(request.getTestId(), "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with ID: " + request.getTestId()));

        BigDecimal testPrice = test.getPrice();
        if (testPrice == null || testPrice.compareTo(BigDecimal.ZERO) == 0) {
            testPrice = test.getOriginalPrice() != null ? test.getOriginalPrice() : BigDecimal.valueOf(199);
        }

        // Check if test already in cart
        CartItem existingItem = cartItemRepository.findByCartIdAndLabTestId(cart.getCartId(), request.getTestId())
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setDiscountPercentage(calculateQuantityDiscount(existingItem.getQuantity()));
            existingItem.calculateFinalPrice();
            cartItemRepository.save(existingItem);
        } else {
            // Create new cart item
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .labTest(test)
                    .itemType(ItemType.LAB_TEST)
                    .itemName(test.getTestName())
                    .itemCode(test.getTestCode())
                    .description(test.getDescription())
                    .quantity(request.getQuantity())
                    .unitPrice(testPrice)
                    .originalPrice(testPrice)
                    .discountPercentage(calculateQuantityDiscount(request.getQuantity()))
                    .fastingRequired(test.getFastingRequired())
                    .turnaroundHours(test.getReportTimeHours())
                    .testsIncluded(1)
                    .build();

            item.calculateFinalPrice();
            cart.addItem(item);
            cartItemRepository.save(item);
        }

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    public CartResponse addPackageToCart(Long userId, AddPackageToCart request) {
        Cart cart = getOrCreateCart(userId);

        TestPackage pkg = testPackageRepository.findById(Objects.requireNonNull(request.getPackageId(), "Package ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with ID: " + request.getPackageId()));

        BigDecimal packagePrice = pkg.getDiscountedPrice() != null ? pkg.getDiscountedPrice() : pkg.getTotalPrice();
        if (packagePrice == null || packagePrice.compareTo(BigDecimal.ZERO) == 0) {
            packagePrice = BigDecimal.valueOf(199);
        }
        BigDecimal originalPackagePrice = pkg.getTotalPrice() != null ? pkg.getTotalPrice() : packagePrice;

        // Check if package already in cart
        if (cartItemRepository.findByCartIdAndPackageId(cart.getCartId(), request.getPackageId()).isPresent()) {
            throw new BadRequestException("This package is already in your cart");
        }

        // Create cart item for package
        CartItem item = CartItem.builder()
                .cart(cart)
                .testPackage(pkg)
                .itemType(ItemType.TEST_PACKAGE)
                .itemName(pkg.getPackageName())
                .itemCode(pkg.getPackageCode())
                .description(pkg.getDescription())
                .quantity(1) // Packages always quantity 1
                .unitPrice(packagePrice)
                .originalPrice(originalPackagePrice)
                .discountPercentage(pkg.getDiscountPercentage() != null ? pkg.getDiscountPercentage() : BigDecimal.ZERO)
                .fastingRequired(pkg.getFastingRequired())
                .turnaroundHours(pkg.getTurnaroundHours())
                .testsIncluded(pkg.getTotalTests())
                .build();

        item.calculateFinalPrice();
        cart.addItem(item);
        cartItemRepository.save(item);

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    public CartResponse addMultipleTests(Long userId, AddMultipleTests request) {
        for (Long testId : request.getTestIds()) {
            addTestToCart(userId, AddTestToCart.builder().testId(testId).quantity(1).build());
        }
        return getCart(userId);
    }

    // ==================== Update/Remove Items ====================

    public CartResponse updateQuantity(Long userId, Long cartItemId, UpdateQuantity request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (item.getItemType() == ItemType.TEST_PACKAGE) {
            throw new BadRequestException("Cannot change quantity for packages");
        }

        if (request.getQuantity() <= 0) {
            return removeFromCart(userId, cartItemId);
        }

        item.setQuantity(request.getQuantity());
        item.setDiscountPercentage(calculateQuantityDiscount(request.getQuantity()));
        item.calculateFinalPrice();
        cartItemRepository.save(item);

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findByCartItemIdAndCartId(cartItemId, cart.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cart.removeItem(item);
        cartItemRepository.delete(Objects.requireNonNull(item, "Cart item must not be null"));

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    public CartResponse clearCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE).orElse(null);

        if (cart != null) {
            cartItemRepository.deleteByCartId(cart.getCartId());
            cart.clearItems();
            cartRepository.save(cart);
        }

        return cart != null ? buildCartResponse(cart) : buildEmptyCartResponse();
    }

    // ==================== Coupon Operations ====================

    public CartResponse applyCoupon(Long userId, ApplyCoupon request) {
        Cart cart = getOrCreateCart(userId);

        Coupon coupon = couponRepository.findByCouponCodeIgnoreCase(request.getCouponCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code"));

        // Validate coupon
        if (!coupon.isValid()) {
            throw new BadRequestException("This coupon is no longer valid");
        }

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("This coupon has expired");
        }

        if (!coupon.meetsMinimumOrder(cart.getSubtotal())) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");
        }

        // Apply coupon
        cart.setCouponCode(coupon.getCouponCode());
        cart.setCouponDiscount(coupon.calculateDiscount(cart.getSubtotal().subtract(cart.getDiscountAmount())));

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    public CartResponse removeCoupon(Long userId) {
        Cart cart = getOrCreateCart(userId);

        cart.setCouponCode(null);
        cart.setCouponDiscount(null);

        recalculateCartTotals(cart);
        return buildCartResponse(cart);
    }

    // ==================== Price Calculations ====================

    private void recalculateCartTotals(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            subtotal = subtotal.add(item.getLineSubtotal());
            discountAmount = discountAmount.add(item.getDiscountAmount());
        }

        cart.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        cart.setDiscountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP));

        // Apply coupon discount if present
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        if (cart.getCouponDiscount() != null && cart.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            afterDiscount = afterDiscount.subtract(cart.getCouponDiscount());
            discountAmount = discountAmount.add(cart.getCouponDiscount());
            cart.setDiscountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP));
        }

        // Calculate tax (GST 18%)
        BigDecimal taxAmount = afterDiscount.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        cart.setTaxAmount(taxAmount);

        // Total = (Subtotal - Discount) + Tax
        BigDecimal totalPrice = afterDiscount.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
        cart.setTotalPrice(totalPrice);

        cart.updateItemCount();
        cartRepository.save(cart);
    }

    private BigDecimal calculateQuantityDiscount(int quantity) {
        if (quantity >= 6) return new BigDecimal("30.00");  // 30% for 6+ tests
        if (quantity >= 3) return new BigDecimal("20.00");  // 20% for 3-5 tests
        if (quantity >= 2) return new BigDecimal("10.00");  // 10% for 2 tests
        return BigDecimal.ZERO;
    }

    // ==================== Response Builders ====================

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::buildCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal totalSavings = cart.getDiscountAmount();
        BigDecimal savingsPercentage = BigDecimal.ZERO;
        if (cart.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
            savingsPercentage = totalSavings.multiply(new BigDecimal("100"))
                    .divide(cart.getSubtotal(), 2, RoundingMode.HALF_UP);
        }

        String savingsMessage = totalSavings.compareTo(BigDecimal.ZERO) > 0
                ? "You save ₹" + totalSavings.setScale(0, RoundingMode.HALF_UP) + " on this order!"
                : null;

        String couponMessage = cart.getCouponCode() != null
                ? "Coupon '" + cart.getCouponCode() + "' applied! Extra ₹" +
                  (cart.getCouponDiscount() != null ? cart.getCouponDiscount().setScale(0, RoundingMode.HALF_UP) : "0") +
                  " off"
                : null;

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUserId())
                .items(itemResponses)
                .itemCount(cart.getItemCount())
                .subtotal(cart.getSubtotal())
                .discountAmount(cart.getDiscountAmount())
                .taxAmount(cart.getTaxAmount())
                .totalPrice(cart.getTotalPrice())
                .couponCode(cart.getCouponCode())
                .couponDiscount(cart.getCouponDiscount())
                .couponMessage(couponMessage)
                .totalSavings(totalSavings)
                .savingsPercentage(savingsPercentage)
                .savingsMessage(savingsMessage)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .expiryAt(cart.getExpiryAt())
                .status(cart.getStatus().name())
                .isEmpty(cart.getItems().isEmpty())
                .build();
    }

    private CartItemResponse buildCartItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .cartItemId(item.getCartItemId())
                .itemId(item.getItemType() == ItemType.LAB_TEST ? item.getLabTestId() : item.getPackageId())
                .itemType(item.getItemType())
                .itemName(item.getItemName())
                .itemCode(item.getItemCode())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .originalPrice(item.getOriginalPrice())
                .discountPercentage(item.getDiscountPercentage())
                .discountAmount(item.getDiscountAmount())
                .finalPrice(item.getFinalPrice())
                .lineTotal(item.getLineSubtotal())
                .testsIncluded(item.getTestsIncluded())
                .fastingRequired(item.getFastingRequired())
                .sampleType(item.getSampleType())
                .turnaroundHours(item.getTurnaroundHours())
                .addedAt(item.getAddedAt())
                .build();
    }

    private CartResponse buildEmptyCartResponse() {
        return CartResponse.builder()
                .items(new ArrayList<>())
                .itemCount(0)
                .subtotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .totalPrice(BigDecimal.ZERO)
                .isEmpty(true)
                .build();
    }

    // ==================== Checkout ====================

    public Cart checkoutCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active cart found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        cart.setStatus(CartStatus.CHECKED_OUT);
        return cartRepository.save(cart);
    }

    // ==================== Scheduled Tasks ====================

    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void cleanupExpiredCarts() {
        log.info("Running cart cleanup job...");

        // Mark expired carts
        int expiredCount = cartRepository.markExpiredCarts(CartStatus.ACTIVE, CartStatus.EXPIRED, LocalDateTime.now());
        log.info("Marked {} carts as expired", expiredCount);

        // Mark abandoned carts (7 days without activity)
        int abandonedCount = cartRepository.markAbandonedCarts(CartStatus.ACTIVE, CartStatus.ABANDONED, LocalDateTime.now().minusDays(7));
        log.info("Marked {} carts as abandoned", abandonedCount);

        // Delete old carts (90 days)
        int deletedCount = cartRepository.deleteOldCarts(
                List.of(CartStatus.EXPIRED, CartStatus.ABANDONED, CartStatus.CHECKED_OUT),
                LocalDateTime.now().minusDays(90)
        );
        log.info("Deleted {} old carts", deletedCount);
    }

    // ==================== Validation Methods ====================

    public boolean isTestInCart(Long userId, Long testId) {
        return cartItemRepository.isTestInCartByStatus(userId, CartStatus.ACTIVE, testId);
    }

    public boolean isPackageInCart(Long userId, Long packageId) {
        return cartItemRepository.isPackageInCartByStatus(userId, CartStatus.ACTIVE, packageId);
    }
}
