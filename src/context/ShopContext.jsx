import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16 >> (Number(c) / 4))).toString(16)
  );
}

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const [categories, setCategories] = useState(['Защита', 'Снаряжение', 'Мерч', 'Аксессуары', 'Награды (Neks)']);

  useEffect(() => {
    let cancelled = false;

    async function hydrateShop() {
      try {
        const response = await fetch('/api/app/state', { credentials: 'include' });
        const data = response.ok ? await response.json() : {};
        const shop = data.state?.shop || {};
        if (cancelled) return;
        setProducts(Array.isArray(shop.products) ? shop.products : []);
        setOrders(Array.isArray(shop.orders) ? shop.orders : []);
      } catch (error) {
        console.error('Failed to hydrate shop state', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    hydrateShop();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();
    async function persistShop() {
      const response = await fetch('/api/app/state', { credentials: 'include', signal: controller.signal });
      const data = response.ok ? await response.json() : {};
      const state = data.state || {};
      await fetch('/api/app/state', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: { ...state, shop: { products, orders } } }),
        signal: controller.signal,
      });
    }

    persistShop().catch((error) => {
      if (error.name !== 'AbortError') console.error('Failed to persist shop state', error);
    });

    return () => controller.abort();
  }, [isReady, products, orders]);

  const addProduct = (product) => {
    setProducts(prev => [...prev, { ...product, id: createId() }]);
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
      id: createId(), 
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
