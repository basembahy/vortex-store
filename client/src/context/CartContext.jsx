import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vortex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vortex_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, accountType, price) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product_id === product.id && item.account_type.toUpperCase() === accountType.toUpperCase()
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          product_title: product.title,
          product_title_ar: product.title_ar,
          image_url: product.image_url,
          account_type: accountType.toUpperCase(),
          price: Number(price),
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (productId, accountType) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product_id === productId && item.account_type.toUpperCase() === accountType.toUpperCase())
      )
    );
  };

  const updateQuantity = (productId, accountType, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId && item.account_type.toUpperCase() === accountType.toUpperCase()) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('vortex_cart');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
