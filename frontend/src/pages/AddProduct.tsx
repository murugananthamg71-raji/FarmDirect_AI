import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sprout, TrendingUp, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const AddProduct: React.FC = () => {
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState('kg');
  const [pricePerUnit, setPricePerUnit] = useState<number>(28);
  const [isOrganic, setIsOrganic] = useState(false);

  // Step 3
  const [district, setDistrict] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600');
  const [harvestDate, setHarvestDate] = useState('2026-09-24');

  // AI Price Modal State
  const [aiModal, setAiModal] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFetchAIPrice = async () => {
    if (!name) {
      alert('Please enter a product name first.');
      return;
    }
    setAiLoading(true);
    setAiModal(true);
    try {
      const res = await api.post('/ai/price-guidance', {
        product_name: name,
        category,
        district,
        current_price: pricePerUnit,
        unit,
      });
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestedPrice = () => {
    if (aiResult?.suggested_recommended) {
      setPricePerUnit(aiResult.suggested_recommended);
    }
    setAiModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/products', {
        name,
        category,
        description: description || `Fresh farm harvested ${name} from ${district}.`,
        image_url: imageUrl,
        quantity,
        unit,
        price_per_unit: pricePerUnit,
        harvest_date: harvestDate,
        district,
        state,
        is_organic: isOrganic,
      });
      navigate('/farmer-dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Step Indicator Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-darktext flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            <span>3-Step Farmer Harvest Listing</span>
          </h1>
          <span className="text-xs font-bold bg-lightbg text-primary px-3 py-1 rounded-full">
            Step {step} of 3
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className={`h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`h-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: WHAT */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Step 1: What produce are you listing?</h3>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Country Tomato / Organic Rice / Red Onion"
                  className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Spices & Herbs">Spices & Herbs</option>
                    <option value="Nuts & Oilseeds">Nuts & Oilseeds</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-sm font-bold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOrganic}
                      onChange={(e) => setIsOrganic(e.target.checked)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <span>🌱 100% Organic Certified</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Harvested fresh from soil, zero chemical pesticides..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!name}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>Next: Quantity & Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: HOW MUCH & PRICE */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Step 2: How much & at what price?</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 font-extrabold text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit Preset</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-gray-300 text-sm font-semibold"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="quintal">quintal (100 kg)</option>
                    <option value="ton">ton (1000 kg)</option>
                    <option value="dozen">dozen</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Price per Unit (₹)</label>
                  <button
                    type="button"
                    onClick={handleFetchAIPrice}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Get AI Price Guidance</span>
                  </button>
                </div>
                <input
                  type="number"
                  required
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  className="w-full px-4 py-3 text-xl rounded-xl border border-gray-300 font-extrabold text-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition flex items-center justify-center space-x-2"
                >
                  <span>Next: Location & Photo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & PHOTO */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 border-b pb-2">Step 3: Farm location & photo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Harvest Image URL</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{loading ? 'Publishing...' : 'Publish Product Listing'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* AI Price Guidance Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-100 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-bold text-darktext flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>AI Price Guidance Advisor</span>
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                Demo Model
              </span>
            </div>

            {aiLoading ? (
              <div className="py-8 text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-xs text-gray-500">Analyzing district mandi modal rates & seasonal demand...</p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-lightbg rounded-xl border border-green-200">
                  <div className="font-bold text-primary uppercase text-[10px]">Suggested Recommended Price</div>
                  <div className="text-2xl font-extrabold text-primary">₹{aiResult.suggested_recommended} / {unit}</div>
                  <p className="text-[11px] text-gray-600 mt-1">{aiResult.explanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-gray-50 border">
                    <div className="text-[10px] font-bold text-gray-500">Min Market Floor</div>
                    <div className="font-bold text-darktext text-sm">₹{aiResult.suggested_min}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 border">
                    <div className="text-[10px] font-bold text-gray-500">Max Peak Target</div>
                    <div className="font-bold text-darktext text-sm">₹{aiResult.suggested_max}</div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 italic">
                  * AI price guidance is an estimate based on demo market data. Verify local mandi prices before making business decisions.
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setAiModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    Keep Current (₹{pricePerUnit})
                  </button>
                  <button
                    onClick={applyAISuggestedPrice}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                  >
                    Apply AI Price (₹{aiResult.suggested_recommended})
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

