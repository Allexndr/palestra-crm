import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('palestra_shop_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('palestra_shop_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(['Защита', 'Снаряжение', 'Мерч', 'Аксессуары']);

  useEffect(() => {
    localStorage.setItem('palestra_shop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('palestra_shop_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const placeOrder = (order) => {
    setOrders(prev => [...prev, { 
      ...order, 
      id: `ORD-${Date.now()}`, 
      status: 'pending',
      createdAt: new Date().toISOString()
    }]);
  };

  const updateOrderStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <ShopContext.Provider value={{ 
      products, categories, orders, 
      addProduct, updateProduct, removeProduct, 
      placeOrder, updateOrderStatus 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
