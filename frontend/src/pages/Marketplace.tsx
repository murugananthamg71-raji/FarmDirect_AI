import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, RefreshCw, Sprout } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { sort_by: sortBy };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (district) params.district = district;
      if (organicOnly) params.organic_only = true;

      const res = await api.get('/products', { params });
      setProducts(res.data.items || []);
    } catch (err: any) {
      setError('Failed to load marketplace products. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, district, organicOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-darktext flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" />
            <span>FarmDirect Marketplace</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fresh produce direct from verified farmers & FPOs across India
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tomato, rice, onion..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
              selectedCategory === ''
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                selectedCategory === c.name
                  ? 'bg-primary text-white font-bold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>🌱 Organic Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none text-xs"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-3">
          <Sprout className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-700">No produce listings found</h3>
          <p className="text-xs text-gray-500">Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

