import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingConfig, setShippingConfig] = useState({
    fixed_delivery_charge: 100,
    free_shipping_threshold: 5000
  });

  // Load cart and shipping settings on mount or user change
  useEffect(() => {
    const loadInitialData = async () => {
      // Load shipping config
      try {
        const shipRes = await api.get('/shipping/config');
        if (shipRes.data?.config) {
          setShippingConfig({
            fixed_delivery_charge: Number(shipRes.data.config.fixed_delivery_charge !== undefined ? shipRes.data.config.fixed_delivery_charge : (shipRes.data.config.base_fee || 100)),
            free_shipping_threshold: Number(shipRes.data.config.free_shipping_threshold !== undefined ? shipRes.data.config.free_shipping_threshold : 5000)
          });
        }
      } catch (e) {
        console.error('Failed to load shipping config in CartContext:', e);
      }

      if (user) {
        if (user.role === 'admin') {
          setCartItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await api.get('/cart');
          if (res.data.success) {
            setCartItems(res.data.items);
          }
        } catch (err) {
          console.error('Failed to fetch backend cart:', err);
        } finally {
          setLoading(false);
        }
      } else {
        const localCart = localStorage.getItem('scentvogue_guest_cart');
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    };

    loadInitialData();
  }, [user]);

  // Sync guest cart to local storage
  const saveGuestCart = (items) => {
    setCartItems(items);
    localStorage.setItem('scentvogue_guest_cart', JSON.stringify(items));
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    if (user?.role === 'admin') {
      toast.error('Administrators are restricted from performing customer shopping actions.');
      return false;
    }
    if (!product) return false;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const prodId = product.id || product.product_id;
    const itemSize = product.selected_size || (product.volume_ml ? `${product.volume_ml}ml` : '100ml');

    if (!prodId) {
      toast.error('Invalid fragrance selection');
      return false;
    }

    if (user) {
      try {
        const res = await api.post('/cart', { product_id: prodId, quantity: qty, selected_size: itemSize });
        if (res.data.success) {
          // Refresh backend cart
          const cartRes = await api.get('/cart');
          setCartItems(cartRes.data.items);
          toast.success(`✨ Added ${product.name} (${itemSize}) to your fragrance bag!`);
          return true;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add item to cart');
        return false;
      }
    } else {
      // Guest mode
      const existingIndex = cartItems.findIndex(item => 
        (item.product_id === prodId || item.id === prodId) && 
        ((item.selected_size || '').toLowerCase() === itemSize.toLowerCase())
      );
      let updatedItems = [...cartItems];

      const activePrice = Number(product.discount_price || product.price || product.active_price || 0);

      if (existingIndex > -1) {
        const newQty = updatedItems[existingIndex].quantity + qty;
        if (newQty > (product.stock_quantity || 99)) {
          toast.warning(`Only ${product.stock_quantity || 99} bottles available.`);
          return false;
        }
        updatedItems[existingIndex].quantity = newQty;
        updatedItems[existingIndex].subtotal = activePrice * newQty;
      } else {
        updatedItems.push({
          cart_item_id: 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          product_id: prodId,
          name: product.name,
          slug: product.slug,
          brand_name: product.brand_name || 'TRY ME BRO',
          primary_image: product.primary_image,
          concentration: product.concentration || 'Eau de Parfum',
          volume_ml: parseInt(itemSize, 10) || product.volume_ml || 100,
          selected_size: itemSize,
          price: Number(product.price || activePrice),
          discount_price: product.discount_price ? Number(product.discount_price) : null,
          active_price: activePrice,
          quantity: qty,
          stock_quantity: product.stock_quantity || 50,
          is_in_stock: true,
          subtotal: activePrice * qty
        });
      }

      saveGuestCart(updatedItems);
      toast.success(`✨ Added ${product.name} (${itemSize}) to your fragrance bag!`);
      return true;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);

    if (user) {
      try {
        await api.put(`/cart/${productId}`, { quantity: qty });
        const cartRes = await api.get('/cart');
        setCartItems(cartRes.data.items);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error updating cart');
      }
    } else {
      if (qty <= 0) {
        removeFromCart(productId);
        return;
      }
      const updated = cartItems.map(item => {
        if (item.product_id === productId) {
          return {
            ...item,
            quantity: qty,
            subtotal: item.active_price * qty
          };
        }
        return item;
      });
      saveGuestCart(updated);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (user) {
      try {
        await api.delete(`/cart/${productId}`);
        const cartRes = await api.get('/cart');
        setCartItems(cartRes.data.items);
        toast.info('Item removed from cart.');
      } catch (err) {
        toast.error('Failed to remove item');
      }
    } else {
      const filtered = cartItems.filter(item => item.product_id !== productId);
      saveGuestCart(filtered);
      toast.info('Item removed from cart.');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setCartItems([]);
      } catch (err) {
        console.error(err);
      }
    } else {
      saveGuestCart([]);
    }
    setAppliedCoupon(null);
  };

  // Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.active_price || item.discount_price || item.price);
    return acc + price * item.quantity;
  }, 0);

  // Calculate Discount (Standard & BOGO Offers)
  let discount = 0;
  if (appliedCoupon) {
    const discountType = (appliedCoupon.discount_type || 'percentage').toLowerCase();
    if (discountType === 'bogo' || discountType === 'buy_x_get_y') {
      const buyQty = Math.max(1, parseInt(appliedCoupon.buy_qty || 1, 10));
      const getQty = Math.max(1, parseInt(appliedCoupon.get_qty || 1, 10));
      const discountPercentForGet = appliedCoupon.discount_percent_for_get !== undefined && appliedCoupon.discount_percent_for_get !== null
        ? Number(appliedCoupon.discount_percent_for_get)
        : 100;
      const bundleSize = buyQty + getQty;

      let applicableProdIds = [];
      if (appliedCoupon.applicable_product_ids) {
        try {
          applicableProdIds = typeof appliedCoupon.applicable_product_ids === 'string'
            ? JSON.parse(appliedCoupon.applicable_product_ids)
            : appliedCoupon.applicable_product_ids;
        } catch (e) {}
      }

      let applicableCatIds = [];
      if (appliedCoupon.applicable_category_ids) {
        try {
          applicableCatIds = typeof appliedCoupon.applicable_category_ids === 'string'
            ? JSON.parse(appliedCoupon.applicable_category_ids)
            : appliedCoupon.applicable_category_ids;
        } catch (e) {}
      }

      const applicableType = appliedCoupon.applicable_type || 'all';
      const qualifyingUnits = [];

      for (const item of cartItems) {
        const prodId = Number(item.product_id || item.id);
        const catId = Number(item.category_id);
        let isEligible = true;

        if (applicableType === 'specific') {
          isEligible = Array.isArray(applicableProdIds) && applicableProdIds.map(Number).includes(prodId);
        } else if (applicableType === 'category') {
          isEligible = Array.isArray(applicableCatIds) && applicableCatIds.map(Number).includes(catId);
        }

        if (isEligible) {
          const unitPrice = Number(item.active_price || item.discount_price || item.price || 0);
          const qty = Number(item.quantity || 1);
          for (let i = 0; i < qty; i++) {
            qualifyingUnits.push({
              productId: prodId,
              name: item.name,
              price: unitPrice
            });
          }
        }
      }

      const qualifyingCount = qualifyingUnits.length;
      const completedBundles = Math.floor(qualifyingCount / bundleSize);
      const freeItemsCount = completedBundles * getQty;

      if (freeItemsCount > 0) {
        qualifyingUnits.sort((a, b) => a.price - b.price);
        const freeUnits = qualifyingUnits.slice(0, freeItemsCount);
        const totalFreeVal = freeUnits.reduce((sum, u) => sum + u.price, 0);
        discount = (totalFreeVal * discountPercentForGet) / 100;
      }
    } else if (discountType === 'percentage') {
      discount = (subtotal * Number(appliedCoupon.discount_value)) / 100;
      if (appliedCoupon.max_discount_amount && discount > Number(appliedCoupon.max_discount_amount)) {
        discount = Number(appliedCoupon.max_discount_amount);
      }
    } else {
      discount = Number(appliedCoupon.discount_value);
    }
    discount = Math.min(discount, subtotal);
  }

  // Fixed delivery charge & free shipping threshold from Admin settings
  const freeShippingThreshold = Number(shippingConfig.free_shipping_threshold || 5000);
  const fixedDeliveryCharge = Number(shippingConfig.fixed_delivery_charge !== undefined ? shippingConfig.fixed_delivery_charge : 100);
  const isFreeShipping = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : fixedDeliveryCharge;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Apply Coupon
  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/coupons/validate', { code, subtotal, items: cartItems });
      if (res.data.success) {
        setAppliedCoupon(res.data.coupon);
        toast.success(res.data.message);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        discount,
        shippingFee,
        finalTotal,
        freeShippingThreshold,
        fixedDeliveryCharge,
        shippingConfig,
        appliedCoupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
