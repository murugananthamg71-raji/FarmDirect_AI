import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Marketplace } from './pages/Marketplace';
import { ProductDetail } from './pages/ProductDetail';
import { AddProduct } from './pages/AddProduct';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { MyOrders } from './pages/MyOrders';
import { OrderTracking } from './pages/OrderTracking';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { LogisticsDashboard } from './pages/LogisticsDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AITools } from './pages/AITools';
import { LogisticsRoute } from './pages/LogisticsRoute';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { NotFound, Forbidden } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-background text-darktext">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/products/:id" element={<ProductDetail />} />

                  {/* Role Protected Routes */}
                  <Route
                    path="/add-product"
                    element={
                      <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                        <AddProduct />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute allowedRoles={['BUYER']}>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['BUYER']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/order-confirmation"
                    element={
                      <ProtectedRoute allowedRoles={['BUYER']}>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/orders/:id/tracking"
                    element={
                      <ProtectedRoute>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/farmer-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                        <FarmerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/buyer-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['BUYER']}>
                        <BuyerDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/logistics-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['LOGISTICS', 'ADMIN']}>
                        <LogisticsDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/ai-tools" element={<AITools />} />

                  <Route
                    path="/logistics-route"
                    element={
                      <ProtectedRoute allowedRoles={['LOGISTICS', 'ADMIN']}>
                        <LogisticsRoute />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/settings" element={<Settings />} />
                  <Route path="/forbidden" element={<Forbidden />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-primary">FarmDirect AI</span> — SIH26033 Working Prototype
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Built for Direct Agricultural Connectivity • AI Demand Forecasting & Smart Logistics
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

