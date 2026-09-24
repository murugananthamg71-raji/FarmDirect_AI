import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (user && user.role === 'BUYER') {
      try {
        const res = await api.get('/cart');
        setCartItems(res.data);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
      }
    } else {
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number) => {
    if (!user) {
      alert('Please log in as a buyer to add items to cart.');
      return;
    }
    try {
      await api.post('/cart/items', { product_id: product.id, quantity });
      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
      } else {
        await api.patch(`/cart/items/${cartItemId}`, { quantity });
        await fetchCart();
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`);
      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove item');
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.quantity * item.price_per_unit, 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

