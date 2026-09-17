import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getSafeStorage, setSafeStorage } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        if (user.role === 'admin') {
          setWishlistItems([]);
          return;
        }
        try {
          setLoading(true);
          const res = await api.get('/wishlist');
          if (res.data.success) {
            setWishlistItems(res.data.wishlist);
          }
        } catch (err) {
          console.error('Failed to load wishlist:', err);
        } finally {
          setLoading(false);
        }
      } else {
        const local = getSafeStorage('scentvogue_wishlist');
        if (local) {
          try {
            setWishlistItems(JSON.parse(local));
          } catch {
            setWishlistItems([]);
          }
        } else {
          setWishlistItems([]);
        }
      }
    };

    loadWishlist();
  }, [user]);

  const saveLocalWishlist = (items) => {
    setWishlistItems(items);
    setSafeStorage('scentvogue_wishlist', JSON.stringify(items));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId || item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (user?.role === 'admin') {
      toast.error('Administrators are restricted from performing wishlist actions.');
      return;
    }
    const prodId = product.product_id || product.id;
    const isCurrentlyIn = isInWishlist(prodId);

    if (user) {
      try {
        const res = await api.post('/wishlist/toggle', { product_id: prodId });
        if (res.data.success) {
          const listRes = await api.get('/wishlist');
          setWishlistItems(listRes.data.wishlist);
          if (res.data.is_in_wishlist) {
            toast.success(`❤️ Added ${product.name} to your Wishlist`);
          } else {
            toast.info(`Removed from Wishlist`);
          }
        }
      } catch (err) {
        toast.error('Failed to update wishlist');
      }
    } else {
      // Guest
      if (isCurrentlyIn) {
        const filtered = wishlistItems.filter(item => (item.product_id || item.id) !== prodId);
        saveLocalWishlist(filtered);
        toast.info(`Removed from Wishlist`);
      } else {
        const updated = [...wishlistItems, {
          id: prodId,
          product_id: prodId,
          name: product.name,
          slug: product.slug,
          brand_name: product.brand_name || 'TRY ME BRO',
          primary_image: product.primary_image,
          price: product.price,
          discount_price: product.discount_price,
          rating: product.rating,
          concentration: product.concentration,
          volume_ml: product.volume_ml
        }];
        saveLocalWishlist(updated);
        toast.success(`❤️ Added ${product.name} to your Wishlist`);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (user) {
      try {
        await api.delete(`/wishlist/${productId}`);
        const listRes = await api.get('/wishlist');
        setWishlistItems(listRes.data.wishlist);
        toast.info('Removed from Wishlist');
      } catch (err) {
        toast.error('Failed to remove item');
      }
    } else {
      const filtered = wishlistItems.filter(item => (item.product_id || item.id) !== productId);
      saveLocalWishlist(filtered);
      toast.info('Removed from Wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
