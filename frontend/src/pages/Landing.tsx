import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ImpactStats } from '../types';
import { api } from '../services/api';
import {
  Sprout,
  ShoppingBag,
  TrendingUp,
  Truck,
  ShieldCheck,
  ArrowRight,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    api
      .get('/admin/impact-stats')
      .then((res) => setStats(res.data))
      .catch(() => {
        // Fallback demo stats
        setStats({
          estimated_farmer_uplift_pct: 22.5,
          estimated_consumer_savings_pct: 18.0,
          route_km_saved: 485,
          total_farmers: 12,
          total_buyers: 8,
          total_orders: 34,
          total_gmv: 145000,
        });
      });
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-lightbg via-white to-background pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-green-100">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-primary font-semibold text-xs px-3.5 py-1.5 rounded-full border border-green-200">
            <Sprout className="w-4 h-4 text-primary" />
            <span>SIH26033 Problem Statement — Direct Agricultural Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-darktext tracking-tight max-w-4xl mx-auto leading-tight">
            Farm Fresh. Fair Prices. <br />
            <span className="text-primary underline decoration-fresh decoration-4 underline-offset-4">
              Direct from Farmers.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Eliminating unnecessary intermediaries to empower farmers with higher earnings, lower prices for consumers, and AI-optimized cold-chain logistics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-lg transition"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{t('hero.explore')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register?role=FARMER"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-white hover:bg-lightbg text-primary border-2 border-primary font-bold text-base transition"
            >
              <Sprout className="w-5 h-5" />
              <span>{t('hero.joinFarmer')}</span>
            </Link>
          </div>

          {/* Demo Tag Banner */}
          <div className="pt-6 inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Demo / Simulated Prototype — All data & models operate with sample datasets</span>
          </div>
        </div>
      </section>

      {/* Live Impact Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-darktext flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Platform Impact Dashboard</span>
              </h2>
              <p className="text-sm text-gray-500">
                Calculated dynamically from real order transactions & logistics metrics
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
              Demo / Simulated Assumptions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-lightbg border border-green-200">
              <div className="text-xs font-semibold text-primary uppercase">Est. Farmer Price Uplift</div>
              <div className="text-3xl font-extrabold text-primary mt-1">
                +{stats?.estimated_farmer_uplift_pct || 22.5}%
              </div>
              <div className="text-xs text-gray-600 mt-1">vs traditional mandi middleman fees</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-xs font-semibold text-blue-700 uppercase">Est. Consumer Savings</div>
              <div className="text-3xl font-extrabold text-blue-700 mt-1">
                -{stats?.estimated_consumer_savings_pct || 18.0}%
              </div>
              <div className="text-xs text-gray-600 mt-1">vs retail market markups</div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="text-xs font-semibold text-purple-700 uppercase">Route Distance Saved</div>
              <div className="text-3xl font-extrabold text-purple-700 mt-1">
                {stats?.route_km_saved || 485} km
              </div>
              <div className="text-xs text-gray-600 mt-1">via 2-Opt algorithm route optimization</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-700 uppercase">Active Network</div>
              <div className="text-3xl font-extrabold text-amber-700 mt-1">
                {(stats?.total_farmers || 12) + (stats?.total_buyers || 8)} Members
              </div>
              <div className="text-xs text-gray-600 mt-1">{stats?.total_farmers || 12} Farmers & FPOs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Side-by-side Price Breakdown Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-darktext">Why FarmDirect AI Works Better</h2>
          <p className="text-gray-600 mt-2">
            Comparing the traditional 5-layer agricultural supply chain with our direct AI platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Chain Card */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-red-900">Traditional Supply Chain</h3>
              <span className="text-xs font-bold bg-red-200 text-red-800 px-2.5 py-1 rounded-full">
                5+ Intermediaries
              </span>
            </div>
            <p className="text-sm text-red-700">
              Farmer → Local Agent → Mandi Trader → Wholesaler → Retailer → Consumer
            </p>
            <div className="space-y-2 pt-2 text-sm text-gray-700">
              <div className="flex justify-between py-1 border-b border-red-200">
                <span>Farmer Receives (Tomato ₹30/kg retail):</span>
                <span className="font-bold text-red-800">₹10 – ₹12 / kg (35%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-200">
                <span>Trader Commission & Spoilage:</span>
                <span className="font-bold">₹10 / kg (33%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-200">
                <span>Retail Markups:</span>
                <span className="font-bold">₹8 – ₹10 / kg (32%)</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-red-900 text-base">
                <span>Consumer Pays:</span>
                <span>₹30.00 / kg</span>
              </div>
            </div>
          </div>

          {/* FarmDirect AI Chain Card */}
          <div className="bg-green-50 border border-green-300 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary">FarmDirect AI Model</h3>
              <span className="text-xs font-bold bg-green-200 text-primary px-2.5 py-1 rounded-full">
                Direct + Smart Logistics
              </span>
            </div>
            <p className="text-sm text-green-800">
              Farmer / FPO → AI Batched Route Logistics → Consumer / Bulk Buyer
            </p>
            <div className="space-y-2 pt-2 text-sm text-gray-700">
              <div className="flex justify-between py-1 border-b border-green-200">
                <span>Farmer Receives Directly:</span>
                <span className="font-bold text-primary">₹18.00 / kg (75%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-green-200">
                <span>Logistics & Platform Fee:</span>
                <span className="font-bold text-gray-700">₹6.00 / kg (25%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-green-200 text-gray-500">
                <span>Intermediary Waste:</span>
                <span className="font-bold text-fresh">₹0.00 (Eliminated)</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-primary text-base">
                <span>Consumer Pays:</span>
                <span>₹24.00 / kg (20% Savings!)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          * Note: Values represent estimated model pricing assumptions for comparison.
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-darktext">How FarmDirect AI Works</h2>
            <p className="text-gray-600 mt-2">End-to-end direct marketplace workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-lightbg text-primary rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg text-darktext">Farmer Lists Product</h3>
              <p className="text-sm text-gray-600">
                Farmers list harvests with AI price guidance & bulk discount tiers.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg text-darktext">Buyer Orders Direct</h3>
              <p className="text-sm text-gray-600">
                Consumers & bulk buyers order fresh produce directly from farmers.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg text-darktext">Smart Route Pickup</h3>
              <p className="text-sm text-gray-600">
                Logistics partners get 2-Opt batched routes with min travel distance.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                4
              </div>
              <h3 className="font-bold text-lg text-darktext">Verified Delivery</h3>
              <p className="text-sm text-gray-600">
                Buyer receives order, tracks timeline, and leaves verified feedback.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

