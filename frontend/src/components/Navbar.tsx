import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Sprout,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  Truck,
  TrendingUp,
  Bell,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'FARMER':
        return '/farmer-dashboard';
      case 'BUYER':
        return '/buyer-dashboard';
      case 'LOGISTICS':
        return '/logistics-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-lightbg flex items-center justify-center text-primary font-bold">
                <Sprout className="w-6 h-6 text-primary" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-primary">
                FarmDirect <span className="text-fresh">AI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/marketplace"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('nav.marketplace')}</span>
            </Link>

            {user && (
              <Link
                to={getDashboardRoute()}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('nav.dashboard')}</span>
              </Link>
            )}

            {user?.role === 'BUYER' && (
              <Link
                to="/orders"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm transition"
              >
                <span>{t('nav.myOrders')}</span>
              </Link>
            )}

            {user?.role === 'LOGISTICS' && (
              <Link
                to="/logistics-route"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm transition"
              >
                <Truck className="w-4 h-4" />
                <span>{t('nav.routeMap')}</span>
              </Link>
            )}

            {(user?.role === 'FARMER' || user?.role === 'ADMIN') && (
              <Link
                to="/ai-tools"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm transition font-semibold text-primary"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('nav.aiTools')}</span>
              </Link>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            {user?.role === 'BUYER' && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-primary transition"
                title="Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-fresh text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                className="relative p-2 text-gray-700 hover:text-primary transition"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-xs font-bold bg-lightbg text-primary px-2.5 py-1 rounded-full border border-green-200">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-primary hover:bg-lightbg text-sm font-semibold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

