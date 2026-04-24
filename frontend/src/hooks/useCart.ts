// Re-export context mapped Cart hook to avoid refactoring hundreds of files
export { useCartContext as useCart } from '../context/CartContext';
export type { CartItem, CartResponse } from '../context/CartContext';
