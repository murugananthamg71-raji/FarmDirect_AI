import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { StatusBadge } from './StatusBadge';
import { MapPin, ShoppingCart, ShieldCheck, Tag } from 'lucide-react';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Image & Badges */}
        <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.is_organic && (
            <span className="absolute top-3 left-3 bg-fresh text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              🌱 Organic
            </span>
          )}
          {product.verification_status === 'DEMO_VERIFIED' && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" /> Verified
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold text-primary uppercase">{product.category}</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{product.district}</span>
            </div>
          </div>

          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-darktext text-base group-hover:text-primary transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>

          <div className="text-xs font-medium text-gray-500 pt-1">
            Sold by: <span className="font-semibold text-gray-700">{product.farm_name || product.farmer_name}</span>
            {product.is_fpo && <span className="ml-1 text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">FPO</span>}
          </div>
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-4 pt-0 space-y-3">
        {product.price_tiers && product.price_tiers.length > 0 && (
          <div className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded-lg flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Bulk tier: ₹{product.price_tiers[0].price_per_unit}/{product.unit} (min {product.price_tiers[0].min_quantity}{product.unit})</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-xl font-extrabold text-primary">₹{product.price_per_unit}</span>
            <span className="text-xs text-gray-500 font-medium"> / {product.unit}</span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

