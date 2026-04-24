package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

@Repository
public interface GatewayPaymentRepository extends JpaRepository<GatewayPayment, Long> {
    @EntityGraph(attributePaths = {"order", "order.user", "order.test", "order.testPackage"})
    java.util.Optional<GatewayPayment> findByTransactionId(String transactionId);

    @EntityGraph(attributePaths = {"order", "order.user", "order.test", "order.testPackage"})
    java.util.List<GatewayPayment> findByOrderId(Long orderId);
}
