import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import StreamsPage from './pages/StreamsPage';

// Buyer pages
import BuyerDashboard from './pages/BuyerDashboard';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import CartPage from './pages/CartPage';

// Seller pages
import SellerDashboard from './pages/SellerDashboard';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerOrdersPage from './pages/SellerOrdersPage';
import SellerProfilePage from './pages/SellerProfilePage';
import SellerStreamsPage from './pages/SellerStreamsPage';

import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/streams" element={<StreamsPage />} />

            {/* Buyer Protected */}
            <Route path="/buyer/dashboard" element={
              <ProtectedRoute allowedRole="buyer"><BuyerDashboard /></ProtectedRoute>
            } />
            <Route path="/buyer/orders" element={
              <ProtectedRoute allowedRole="buyer"><BuyerOrdersPage /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute allowedRole="buyer"><CartPage /></ProtectedRoute>
            } />

            {/* Seller Protected */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute allowedRole="seller"><SellerDashboard /></ProtectedRoute>
            } />
            <Route path="/seller/products" element={
              <ProtectedRoute allowedRole="seller"><SellerProductsPage /></ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute allowedRole="seller"><SellerOrdersPage /></ProtectedRoute>
            } />
            <Route path="/seller/profile" element={
              <ProtectedRoute allowedRole="seller"><SellerProfilePage /></ProtectedRoute>
            } />
            <Route path="/seller/streams" element={
              <ProtectedRoute allowedRole="seller"><SellerStreamsPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
