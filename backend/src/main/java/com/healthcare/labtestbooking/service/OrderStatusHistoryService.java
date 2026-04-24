package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.OrderRepository;
import com.healthcare.labtestbooking.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderStatusHistoryService {

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public OrderStatusHistory saveHistory(OrderStatusHistory history) {
        log.info("Saving order status history for order id: {}", history.getOrder().getId());
        return orderStatusHistoryRepository.save(history);
    }

    @Transactional
    public OrderStatusHistory recordStatusChange(Long orderId, OrderStatus newStatus, String notes, String changedBy) {
        log.info("Recording status change for order id: {} to status: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .status(newStatus)
                .note(notes)
                .changedBy(changedBy)
                .build();

        return orderStatusHistoryRepository.save(history);
    }

    public List<OrderStatusHistory> getHistoryForOrder(Long orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId);
    }

    public List<OrderStatusHistory> getAllHistory() {
        return orderStatusHistoryRepository.findAll();
    }
}
