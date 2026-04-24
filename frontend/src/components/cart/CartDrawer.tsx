import React from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import { notify } from '../../utils/toast';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart } = useCartContext();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    const items = cart?.items ?? [];
    const hasValidItems = items.some((item) => {
      const id = item.testId ?? item.packageId;
      return Boolean(id) && Number(item.quantity || 0) > 0 && Number(item.price || 0) > 0;
    });
    if (!hasValidItems) {
      notify.error('Cart updated locally. Please add a valid item to continue.');
      return;
    }
    setIsCartOpen(false);
    navigate('/booking', {
      state: {
        cartItems: items,
        total: cart?.totalPrice ?? cart?.subtotal ?? 0
      }
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100/50 text-[#0D7C7C] rounded-xl">
                  <ShoppingCart size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Your Cart</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cart?.itemCount || 0} Items</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 space-y-4">
              {(!cart || cart.items.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                   <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                     <ShoppingCart size={40} strokeWidth={2} />
                   </div>
                   <h3 className="text-base font-bold text-slate-700">Your cart is empty</h3>
                   <p className="text-xs text-slate-500 mt-2 max-w-[200px]">Looks like you haven't added any tests or packages yet.</p>
                   <button 
                     onClick={() => { setIsCartOpen(false); navigate('/tests'); }}
                     className="mt-6 px-6 py-2.5 bg-[#0D7C7C] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#084747] transition-colors"
                   >
                     Browse Tests
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                    {cart.items.map((item) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.cartItemId} 
                        className="bg-white border text-left border-gray-100 p-4 rounded-2xl shadow-sm relative group"
                      >
                         <button 
                            onClick={() => removeItem(item.cartItemId)}
                            className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 shadow-sm transition-opacity hover:bg-red-50"
                         >
                            <Trash2 size={12} strokeWidth={3} />
                         </button>
                         
                         <div className="flex gap-4">
                             <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                <Activity size={20} strokeWidth={2} className={item.isPackage ? "text-purple-500" : "text-[#0D7C7C]"} />
                             </div>
                             <div className="flex-1">
                                 <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1 pr-4">{item.name || item.testName || item.packageName}</h4>
                                 <p className="text-[10px] font-bold tracking-widest text-[#0D7C7C] uppercase">{item.isPackage ? 'Package' : 'Lab Test'}</p>
                                 
                                 <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                                        <button 
                                          onClick={() => {
                                             if(item.quantity > 1) updateQuantity(item.cartItemId, item.quantity - 1);
                                          }}
                                          className="p-1 px-2.5 text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                        >
                                          <Minus size={14} strokeWidth={2.5}/>
                                        </button>
                                        <span className="text-xs font-bold px-2 w-6 text-center select-none text-slate-800">{item.quantity}</span>
                                        <button 
                                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                          className="p-1 px-2.5 text-[#0D7C7C] hover:bg-teal-50 active:bg-teal-100 transition-colors"
                                        >
                                          <Plus size={14} strokeWidth={2.5}/>
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-slate-800">₹{item.total}</div>
                                    </div>
                                 </div>
                             </div>
                         </div>
                      </motion.div>
                    ))}
                    
                    <div className="flex justify-end pt-2">
                       <button onClick={clearCart} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors flex items-center gap-1"><Trash2 size={10} strokeWidth={3}/> Clear Cart</button>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-slate-100 p-6 bg-white shrink-0">
                 <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight">₹{cart.subtotal}</span>
                 </div>
                 
                 <button 
                   onClick={handleCheckout}
                   className="w-full bg-slate-900 text-white font-bold text-sm tracking-widest uppercase py-4 rounded-2xl shadow-lg hover:bg-[#0D7C7C] hover:shadow-xl hover:shadow-[#0D7C7C]/20 transition-all flex justify-between items-center px-6"
                 >
                   <span>Checkout Securely</span>
                   <span className="flex items-center gap-1"><ChevronRight size={16} strokeWidth={3} /></span>
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
