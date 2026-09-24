import React, { useState } from 'react';
import { api } from '../services/api';
import { DemandResult, PriceResult } from '../types';
import { FairPriceBreakdown } from '../components/FairPriceBreakdown';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, Sprout, AlertCircle, Info } from 'lucide-react';

export const AITools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEMAND' | 'PRICE'>('DEMAND');

  // Demand Forecast state
  const [category, setCategory] = useState('Vegetables');
  const [district, setDistrict] = useState('Coimbatore');
  const [demandResult, setDemandResult] = useState<DemandResult | null>(null);
  const [demandLoading, setDemandLoading] = useState(false);

  // Price Guidance state
  const [productName, setProductName] = useState('Tomato');
  const [priceCategory, setPriceCategory] = useState('Vegetables');
  const [priceDistrict, setPriceDistrict] = useState('Coimbatore');
  const [currentPrice, setCurrentPrice] = useState<number>(28);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleFetchDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemandLoading(true);
    try {
      const res = await api.post('/ai/demand-forecast', { category, district });
      setDemandResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDemandLoading(false);
    }
  };

  const handleFetchPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriceLoading(true);
    try {
      const res = await api.post('/ai/price-guidance', {
        product_name: productName,
        category: priceCategory,
        district: priceDistrict,
        current_price: currentPrice,
        unit: 'kg',
      });
      setPriceResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>AI Demand Forecast & Price Guidance Engine</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Machine learning forecast models trained on 2-year regional mandi history & seasonal benchmarks
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('DEMAND')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'DEMAND' ? 'bg-primary text-white shadow-xs' : 'text-gray-600'
            }`}
          >
            📈 Demand Forecasting
          </button>
          <button
            onClick={() => setActiveTab('PRICE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'PRICE' ? 'bg-primary text-white shadow-xs' : 'text-gray-600'
            }`}
          >
            🏷️ Fair Price Guidance
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center gap-2 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Demo / Simulated Model Notice:</strong> AI predictions are estimates based on synthetic demo datasets. Verify local mandi market prices before making business decisions.
        </span>
      </div>

      {/* TAB 1: DEMAND FORECASTING */}
      {activeTab === 'DEMAND' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-darktext">Forecast Parameters</h3>

            <form onSubmit={handleFetchDemand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Produce Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains & Pulses">Grains & Pulses</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                  <option value="Nuts & Oilseeds">Nuts & Oilseeds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                >
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Erode">Erode</option>
                  <option value="Thanjavur">Thanjavur</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={demandLoading}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-dark transition cursor-pointer"
              >
                {demandLoading ? 'Predicting...' : 'Generate 4-Week AI Forecast'}
              </button>
            </form>
          </div>

          {/* Forecast Output Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            {!demandResult ? (
              <div className="py-20 text-center space-y-2">
                <TrendingUp className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">Select parameters and click generate to view demand trend chart.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">GradientBoosting Model Output</span>
                    <h3 className="text-xl font-extrabold text-darktext">
                      {demandResult.category} Demand in {demandResult.district}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        demandResult.demand_level === 'HIGH'
                          ? 'bg-green-100 text-primary border border-green-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Demand Level: {demandResult.demand_level}
                    </span>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandResult.chart_data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="demand_kg" stroke="#2E7D32" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-4 rounded-xl bg-lightbg border border-green-200 space-y-1 text-xs">
                  <div className="font-bold text-primary">💡 Inventory Recommendation</div>
                  <p className="text-gray-700">{demandResult.stock_planning_recommendation}</p>
                  <p className="text-gray-500 text-[11px] pt-1">{demandResult.explanation}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FAIR PRICE GUIDANCE */}
      {activeTab === 'PRICE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-darktext">Price Parameters</h3>

            <form onSubmit={handleFetchPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                <select
                  value={priceCategory}
                  onChange={(e) => setPriceCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains & Pulses">Grains & Pulses</option>
                  <option value="Spices & Herbs">Spices & Herbs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Current Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={priceLoading}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-dark transition cursor-pointer"
              >
                {priceLoading ? 'Analyzing...' : 'Calculate AI Price Guidance'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            {!priceResult ? (
              <div className="py-20 text-center space-y-2">
                <DollarSign className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">Submit parameters to receive AI price guidance & breakdown.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">Benchmark Advisor</span>
                    <h3 className="text-xl font-extrabold text-darktext">{priceResult.product_name} Price Analysis</h3>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-primary rounded-full text-xs font-bold">
                    Status: {priceResult.current_price_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-gray-50 border">
                    <div className="text-xs font-bold text-gray-500">Min Market Floor</div>
                    <div className="text-2xl font-extrabold text-gray-800">₹{priceResult.suggested_min}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-lightbg border border-green-200">
                    <div className="text-xs font-bold text-primary">AI Recommended</div>
                    <div className="text-2xl font-extrabold text-primary">₹{priceResult.suggested_recommended}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border">
                    <div className="text-xs font-bold text-gray-500">Max Target</div>
                    <div className="text-2xl font-extrabold text-gray-800">₹{priceResult.suggested_max}</div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {priceResult.explanation}
                </p>

                <FairPriceBreakdown pricePerUnit={priceResult.suggested_recommended} unit="kg" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

