import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import useScrollAnimation from './hooks/useScrollAnimation';

// Pages
import Home from './Pages/Home';
import Shop from './Pages/Shop';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Checkout from './Pages/Checkout';
import OrderSuccess from './Pages/OrderSuccess';
import Wishlist from './Pages/Wishlist';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AdminLogin from './Pages/AdminLogin';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Reviews from './Pages/Reviews';
import SubmitReview from './Pages/SubmitReview';
import VideoReviewDetail from './Pages/VideoReviewDetail';
import SupportChat from './Pages/SupportChat';
import AdminDashboard from './Pages/AdminDashboard';
import AdminOrderDetail from './Pages/AdminOrderDetail';
import AdminProductForm from './Pages/AdminProductForm';
import AdminCouponForm from './Pages/AdminCouponForm';
import AdminReviewForm from './Pages/AdminReviewForm';

function AppRoutes() {
  // Activate automatic in/out viewport animation on scroll and route changes
  useScrollAnimation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAdminDashboard = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  // Strictly restrict administrator accounts from accessing customer storefront or user side
  useEffect(() => {
    if (token && user?.role === 'admin') {
      const isUserSide = !location.pathname.startsWith('/admin');
      if (isUserSide) {
        toast.warn('Administrator accounts are strictly restricted from accessing the customer storefront.');
        navigate('/admin', { replace: true });
      }
    }
  }, [token, user, location.pathname, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Executive Admin Navbar on Admin Dashboard, Storefront Luxury Navbar on Customer Pages */}
      {isAdminDashboard ? (
        <AdminNavbar />
      ) : (
        <Navbar />
      )}

      {/* Main Content with Route In & Out Transitions */}
      <div style={{ flex: 1 }}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:identifier" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-success/:orderNumber" 
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } 
            />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews/new" element={<SubmitReview />} />
            <Route path="/reviews/video/:id" element={<VideoReviewDetail />} />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <SupportChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <SupportChat />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin/login1111" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrderDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/:orderNumber" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrderDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products/new" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminProductForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products/edit/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminProductForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/coupons/new" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminCouponForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/coupons/edit/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminCouponForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reviews/new" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminReviewForm />
                </ProtectedRoute>
              } 
            />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </div>

      {/* Luxury Footer for Storefront */}
      {!isAdminDashboard && <Footer />}

      {/* Toast Notification Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppRoutes />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
