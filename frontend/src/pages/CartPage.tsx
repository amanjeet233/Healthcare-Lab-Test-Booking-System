import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PromoCodeInput from '@/components/payment/PromoCodeInput';
import type { AppliedCoupon } from '@/types/promo';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import { notify } from '@/utils/toast';
import './CartPage.css';

export default function CartPage() {
  const {
    cart,
    loading,
    error,
    fetchCart,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // ✅ LOAD CART ON MOUNT
  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ HANDLE REMOVE
  const handleRemove = async (cartItemId: number) => {
    setRemovingId(cartItemId);
    try {
      await removeItem(cartItemId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
    setRemovingId(null);
  };

  // ✅ HANDLE UPDATE QUANTITY
  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingId(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
    setUpdatingId(null);
  };

  // ✅ HANDLE CLEAR CART
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
  };

  // ✅ HANDLE APPLY COUPON
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponError('');
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  // ✅ HANDLE REMOVE COUPON
  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (err) {
      console.error('Error removing coupon:', err);
    }
  };

  if (loading && !cart) {
    return <LoadingSpinner />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some tests to get started!</p>
          <Link to="/tests" className="back-btn">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* ✅ HEADER */}
        <div className="cart-header">
          <h1>🛒 Your Shopping Cart</h1>
          <Link to="/tests" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>

        {/* ✅ ERROR */}
        {error && (
          <div className="error-alert">
            {error.toLowerCase().includes('locally') ? 'ℹ️' : '❌'} {error}
          </div>
        )}

        {/* ✅ ITEMS LIST */}
        <div className="cart-items">
          <div className="items-header">
            <span>Item</span>
            <span>Unit Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Action</span>
          </div>

          {cart.items.map((item, index) => (
            <div
              key={item.cartItemId}
              className="cart-item"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="item-name">
                <div className="item-icon">💊</div>
                <div className="item-info">
                  <h4>{item.testName || item.packageName || item.name}</h4>
                  <small>ID: {item.testId || item.packageId}</small>
                </div>
              </div>

              <div className="item-price">
                ₹{(item.price || 0).toFixed(2)}
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updatingId === item.cartItemId}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.cartItemId, parseInt(e.target.value) || 1)}
                  disabled={updatingId === item.cartItemId}
                  className="qty-input"
                />
                <button
                  onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                  disabled={updatingId === item.cartItemId}
                  className="qty-btn"
                >
                  +
                </button>
              </div>

              <div className="item-total">
                ₹{(item.finalPrice || item.total || item.price * item.quantity).toFixed(2)}
                {item.discount && item.discount > 0 && (
                  <div className="discount-badge">
                    -₹{item.discount.toFixed(2)}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemove(item.cartItemId)}
                disabled={removingId === item.cartItemId}
                className="remove-btn"
              >
                {removingId === item.cartItemId ? '⏳' : '🗑️'}
              </button>
            </div>
          ))}
        </div>

        {/* ✅ SUMMARY */}
        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>

            {/* ✅ ENHANCED PROMO CODE SECTION */}
            <PromoCodeInput
              cartValue={cart.subtotal}
              appliedCoupon={cart.couponCode ? {
                code: cart.couponCode,
                discountAmount: cart.discountAmount || 0
              } : undefined}
              onApplyPromo={async (coupon: AppliedCoupon) => {
                try {
                  await applyCoupon(coupon.code);
                } catch (err) {
                  console.error('Error applying coupon:', err);
                }
              }}
              onRemovePromo={async () => {
                try {
                  await removeCoupon();
                } catch (err) {
                  console.error('Error removing coupon:', err);
                }
              }}
              testIds={cart.items.map((item) => item.testId || item.packageId || '')}
              showSuggestions={true}
              showFeatured={false}
            />

            <div className="summary-row">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{cart.subtotal.toFixed(2)}</span>
            </div>

            {cart.discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-₹{cart.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row tax">
              <span>Tax (18% GST)</span>
              <span>₹{cart.taxAmount.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <strong>Total Amount</strong>
              <strong className="total-amount">₹{cart.totalPrice.toFixed(2)}</strong>
            </div>

            <button
              className="checkout-btn"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('login');
                  return;
                }
                const validItems = cart.items.filter((item) => {
                  const id = item.testId ?? item.packageId;
                  return Boolean(id) && Number(item.quantity || 0) > 0 && Number(item.price || 0) > 0;
                });
                if (validItems.length === 0) {
                  notify.error('Cart updated locally. Please add a valid item to continue.');
                  return;
                }
                navigate('/booking', {
                  state: {
                    cartItems: validItems,
                    total: cart.totalPrice
                  }
                });
              }}
            >
              📋 Proceed to Booking
            </button>

            <button
              onClick={handleClearCart}
              className="clear-cart-btn"
            >
              🗑️ Clear Cart
            </button>

            {/* ✅ INFO BOX */}
            <div className="info-box">
              <p>✓ Free home sample collection</p>
              <p>✓ Reports in 24-48 hours</p>
              <p>✓ 24/7 customer support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
