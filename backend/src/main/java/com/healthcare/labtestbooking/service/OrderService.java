package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.OrderRequest;
import com.healthcare.labtestbooking.dto.OrderResponse;
import com.healthcare.labtestbooking.entity.Cart;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.CartRepository;
import com.healthcare.labtestbooking.repository.OrderRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final OrderStatusHistoryService orderStatusHistoryService;

    @Transactional
    public Order createOrder(Order order) {
        log.info("Creating order with reference: {}", order.getOrderReference());
        return orderRepository.save(order);
    }

    @Transactional
    public OrderResponse createOrderFromCart(Long userId, OrderRequest request) {
        log.info("Creating order from cart for user: {}", userId);

        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get cart
        Cart cart = cartRepository.findById(request.getCartId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (!cart.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cart does not belong to this user");
        }

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot create order from empty cart");
        }

        // Generate unique order reference
        String orderReference = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Create order entity
        Order order = Order.builder()
                .orderReference(orderReference)
                .user(user)
                .status(OrderStatus.PENDING)
                .slotInfo(request.getPreferredTimeSlot() + " on " + request.getPreferredDate())
                .paymentInfo(request.getContactEmail() + " | " + request.getContactPhone())
                .technicianInfo(request.getSpecialInstructions())
                .lastStatusChangedAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with reference: {}", orderReference);

        // Create initial status history entry
        orderStatusHistoryService.recordStatusChange(
                savedOrder.getId(),
                OrderStatus.PENDING,
                "Order created from cart",
                user.getEmail()
        );

        // Checkout the cart (mark as checked out)
        cartService.checkoutCart(userId);

        return buildOrderResponse(savedOrder, user, cart);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        log.info("Fetching orders for user: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return orderRepository.findByUserId(userId, pageable);
    }

    public Page<OrderResponse> getUserOrdersAsResponse(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return getUserOrders(userId, pageable)
                .map(order -> buildOrderResponse(order, user, null));
    }

    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order with id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Only allow deletion of pending orders
        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new IllegalArgumentException("Cannot delete order with status: " + order.getStatus());
        }

        orderRepository.deleteById(id);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus, String notes, String updatedBy) {
        log.info("Updating order status for id: {} to {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(newStatus);
        order.setLastStatusChangedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Record status change in history
        orderStatusHistoryService.recordStatusChange(orderId, newStatus, notes, updatedBy);

        User user = order.getUser();
        return buildOrderResponse(savedOrder, user, null);
    }

    private OrderResponse buildOrderResponse(Order order, User user, Cart cart) {
        List<OrderResponse.OrderItemResponse> items = cart != null
                ? cart.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .cartItemId(item.getCartItemId())
                        .itemName(item.getItemName())
                        .itemCode(item.getItemCode())
                        .itemType(item.getItemType().name())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .discountPercentage(item.getDiscountPercentage())
                        .lineTotal(item.getLineSubtotal())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        BigDecimal subtotal = cart != null ? cart.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = cart != null ? cart.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = cart != null ? cart.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = cart != null ? cart.getTotalPrice() : BigDecimal.ZERO;

        String preferredDate = order.getSlotInfo() != null
                ? order.getSlotInfo().split(" on ")[order.getSlotInfo().contains(" on ") ? 1 : 0]
                : "";

        String preferredTimeSlot = order.getSlotInfo() != null
                ? order.getSlotInfo().split(" on ")[0]
                : "";

        return OrderResponse.builder()
                .id(order.getId())
                .orderReference(order.getOrderReference())
                .userId(user.getId())
                .userName(user.getName())
                .status(order.getStatus())
                .items(items)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .preferredTimeSlot(preferredTimeSlot)
                .preferredDate(preferredDate)
                .specialInstructions(order.getTechnicianInfo())
                .contactEmail(order.getPaymentInfo() != null ? order.getPaymentInfo().split(" \\| ")[0] : "")
                .contactPhone(order.getPaymentInfo() != null && order.getPaymentInfo().contains(" | ")
                        ? order.getPaymentInfo().split(" \\| ")[1]
                        : "")
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .lastStatusChangedAt(order.getLastStatusChangedAt())
                .build();
    }
}
