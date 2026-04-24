package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Cart.CartStatus;
import com.healthcare.labtestbooking.entity.CartItem;
import com.healthcare.labtestbooking.entity.CartItem.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Find all items in a cart
    List<CartItem> findByCartCartId(Long cartId);

    // Find item by ID and cart ID
    @Query("SELECT ci FROM CartItem ci WHERE ci.cartItemId = :itemId AND ci.cart.cartId = :cartId")
    Optional<CartItem> findByCartItemIdAndCartId(@Param("itemId") Long itemId, @Param("cartId") Long cartId);

    // Check if lab test already in cart
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId AND ci.labTest.id = :testId")
    Optional<CartItem> findByCartIdAndLabTestId(@Param("cartId") Long cartId, @Param("testId") Long testId);

    // Check if package already in cart
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId AND ci.testPackage.id = :packageId")
    Optional<CartItem> findByCartIdAndPackageId(@Param("cartId") Long cartId, @Param("packageId") Long packageId);

    // Find items by type
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId AND ci.itemType = :itemType")
    List<CartItem> findByCartIdAndItemType(@Param("cartId") Long cartId, @Param("itemType") ItemType itemType);

    // Count items in cart
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    long countByCartId(@Param("cartId") Long cartId);

    // Delete all items in cart
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);

    // Delete item by ID and cart ID (security)
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cartItemId = :itemId AND ci.cart.cartId = :cartId")
    int deleteByCartItemIdAndCartId(@Param("itemId") Long itemId, @Param("cartId") Long cartId);

    // Sum of quantities in cart
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    int sumQuantityByCartId(@Param("cartId") Long cartId);

    // Check if test exists in any active cart for user
    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CartItem ci " +
           "WHERE ci.cart.user.id = :userId AND ci.cart.status = :status AND ci.labTest.id = :testId")
    boolean isTestInCartByStatus(@Param("userId") Long userId, @Param("status") CartStatus status, @Param("testId") Long testId);

    // Check if package exists in any active cart for user
    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CartItem ci " +
           "WHERE ci.cart.user.id = :userId AND ci.cart.status = :status AND ci.testPackage.id = :packageId")
    boolean isPackageInCartByStatus(@Param("userId") Long userId, @Param("status") CartStatus status, @Param("packageId") Long packageId);
}
