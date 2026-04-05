import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';

export default function LoadingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // --- ЗАХИСТ МАРШРУТУ ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    // Loading is only for drivers and dispatchers
    if (!isAuthenticated || (userRole !== 'driver' && userRole !== 'dispatcher')) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // --- СТАНИ ФОРМИ ---
  const [quantity, setQuantity] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState('delta');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функції для кастомного лічильника
  const decreaseQty = () => setQuantity(prev => (prev > 0 ? prev - 1 : 0));
  const increaseQty = () => setQuantity(prev => prev + 1);

  // Імітація відправки форми
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity === 0) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setQuantity(0);
      alert('Loading confirmed successfully!');
    }, 1000);
  };

  if (isLoading) return null;

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans animate-[fadeIn_0.3s_ease-in-out]">
      <Head><title>New Loading | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <Sidebar activePage="loading" />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
        <div className="max-w-4xl flex flex-col gap-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">New Loading</h1>
          </div>

          <form onSubmit={handleConfirm} className="flex flex-col gap-10 mt-4">
            
            {/* SELECT PRODUCT & QUANTITY */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Product</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                
                {/* Custom Dropdown */}
                <div className="relative flex-1">
                  <select className="w-full bg-white border border-gray-100 shadow-sm rounded-3xl p-5 text-gray-500 font-medium text-lg outline-none focus:border-[#DA291C] appearance-none cursor-pointer transition-all">
                    <option value="none">None</option>
                    <option value="productA">Product A (Critical)</option>
                    <option value="productB">Product B (Standard)</option>
                  </select>
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Custom Counter */}
                <div className="bg-gray-50 border border-gray-100 shadow-sm rounded-3xl p-2 flex items-center justify-between w-full sm:w-48 h-[68px]">
                  <button type="button" onClick={decreaseQty} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-2xl transition-colors font-bold text-xl">-</button>
                  <span className="font-bold text-gray-900 text-lg w-12 text-center">{quantity}</span>
                  <button type="button" onClick={increaseQty} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-2xl transition-colors font-bold text-xl">+</button>
                </div>
              </div>
            </div>

            {/* SELECT DELIVERY POINT */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Delivery Point</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Point Delta */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="delta" checked={selectedPoint === 'delta'} onChange={() => setSelectedPoint('delta')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#DA291C] peer-checked:bg-red-50 transition-all flex items-center justify-center gap-4 hover:border-red-200 shadow-sm">
                    <span className="w-5 h-5 bg-[#DA291C] rounded-full shrink-0"></span> Point Delta
                  </div>
                </label>

                {/* Point Alpha */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="alpha" checked={selectedPoint === 'alpha'} onChange={() => setSelectedPoint('alpha')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#FBBF24] peer-checked:bg-yellow-50 transition-all flex items-center justify-center gap-4 hover:border-yellow-200 shadow-sm">
                    <span className="w-5 h-5 bg-[#FBBF24] rounded-full shrink-0"></span> Point Alpha
                  </div>
                </label>

                {/* Point Beta */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="beta" checked={selectedPoint === 'beta'} onChange={() => setSelectedPoint('beta')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#A3E635] peer-checked:bg-[#A3E635]/10 transition-all flex items-center justify-center gap-4 hover:border-[#A3E635]/50 shadow-sm">
                    <span className="w-5 h-5 bg-[#A3E635] rounded-full shrink-0"></span> Point Beta
                  </div>
                </label>

                {/* Point Gamma */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="gamma" checked={selectedPoint === 'gamma'} onChange={() => setSelectedPoint('gamma')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#A3E635] peer-checked:bg-[#A3E635]/10 transition-all flex items-center justify-center gap-4 hover:border-[#A3E635]/50 shadow-sm">
                    <span className="w-5 h-5 bg-[#A3E635] rounded-full shrink-0"></span> Point Gamma
                  </div>
                </label>

              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-4">
              <button 
                type="submit" 
                disabled={quantity === 0 || isSubmitting}
                className={`w-full font-bold py-6 rounded-[28px] transition-all flex items-center justify-center gap-3 text-xl shadow-sm
                  ${quantity > 0 
                    ? 'bg-[#DA291C] hover:bg-red-700 text-white shadow-lg shadow-red-500/30 active:scale-[0.98]' 
                    : 'bg-[#E5A5A4] text-white/90 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Confirm Loading
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}