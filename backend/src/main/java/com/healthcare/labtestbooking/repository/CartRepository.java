package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Cart;
import com.healthcare.labtestbooking.entity.Cart.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Find active cart by user ID
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.status = :status")
    Optional<Cart> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") CartStatus status);

    // Find cart by user ID (any status)
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Cart> findByUserId(@Param("userId") Long userId);

    // Find by cart ID and user ID
    @Query("SELECT c FROM Cart c WHERE c.cartId = :cartId AND c.user.id = :userId")
    Optional<Cart> findByCartIdAndUserId(@Param("cartId") Long cartId, @Param("userId") Long userId);

    // Find expired carts
    @Query("SELECT c FROM Cart c WHERE c.status = :status AND c.expiryAt < :now")
    List<Cart> findExpiredCarts(@Param("status") CartStatus status, @Param("now") LocalDateTime now);

    // Find abandoned carts (not updated in X days)
    @Query("SELECT c FROM Cart c WHERE c.status = :status AND c.updatedAt < :cutoffDate")
    List<Cart> findAbandonedCarts(@Param("status") CartStatus status, @Param("cutoffDate") LocalDateTime cutoffDate);

    // Count active carts with items
    @Query("SELECT COUNT(c) FROM Cart c WHERE c.status = :status AND c.itemCount > 0")
    long countCartsWithItemsByStatus(@Param("status") CartStatus status);

    // Mark expired carts
    @Modifying
    @Query("UPDATE Cart c SET c.status = :newStatus WHERE c.status = :currentStatus AND c.expiryAt < :now")
    int markExpiredCarts(@Param("currentStatus") CartStatus currentStatus,
                         @Param("newStatus") CartStatus newStatus,
                         @Param("now") LocalDateTime now);

    // Mark abandoned carts
    @Modifying
    @Query("UPDATE Cart c SET c.status = :newStatus WHERE c.status = :currentStatus AND c.updatedAt < :cutoffDate")
    int markAbandonedCarts(@Param("currentStatus") CartStatus currentStatus,
                           @Param("newStatus") CartStatus newStatus,
                           @Param("cutoffDate") LocalDateTime cutoffDate);

    // Delete old carts
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.status IN :statuses AND c.updatedAt < :cutoffDate")
    int deleteOldCarts(@Param("statuses") List<CartStatus> statuses, @Param("cutoffDate") LocalDateTime cutoffDate);

    // Find carts by status
    List<Cart> findByStatus(CartStatus status);

    // Check if user has active cart
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.id = :userId AND c.status = :status")
    boolean hasCartByStatus(@Param("userId") Long userId, @Param("status") CartStatus status);
}
