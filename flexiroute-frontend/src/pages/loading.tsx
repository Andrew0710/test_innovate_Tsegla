import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function LoadingPage() {
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
      alert('Loading confirmed successfully!'); // Тут можна додати Toast, як на сторінці Stock
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans animate-[fadeIn_0.3s_ease-in-out]">
      <Head><title>New Loading | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-[#1A1A1A] text-white flex-col justify-between shrink-0 z-20 shadow-xl">
        <div>
          <div className="p-8 pb-12">
            <span className="text-2xl font-black tracking-tighter">Flexi<span className="text-[#DA291C]">R</span>oute</span>
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Urgency Hub
            </Link>
            <Link href="/stock" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Stock Management
            </Link>
            {/* Активний пункт меню (Loading) */}
            <Link href="/loading" className="flex items-center gap-4 px-4 py-3 rounded-xl text-white font-bold transition-all relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Loading
            </Link>
            <Link href="/trucks" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
              Trucks
            </Link>
          </nav>
        </div>
      </aside>

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
                
                {/* Custom Dropdown (Стилізований під макет) */}
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

                {/* Custom Counter (- 0 +) */}
                <div className="bg-gray-50 border border-gray-100 shadow-sm rounded-3xl p-2 flex items-center justify-between w-full sm:w-48 h-[68px]">
                  <button type="button" onClick={decreaseQty} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-2xl transition-colors font-bold text-xl">-</button>
                  <span className="font-bold text-gray-900 text-lg w-12 text-center">{quantity}</span>
                  <button type="button" onClick={increaseQty} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-2xl transition-colors font-bold text-xl">+</button>
                </div>
              </div>
            </div>

            {/* SELECT DELIVERY POINT (Кастомні картки) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Delivery Point</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Point Delta (Red) */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="delta" checked={selectedPoint === 'delta'} onChange={() => setSelectedPoint('delta')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#DA291C] peer-checked:bg-red-50 transition-all flex items-center justify-center gap-4 hover:border-red-200 shadow-sm">
                    <span className="w-5 h-5 bg-[#DA291C] rounded-full shrink-0"></span> Point Delta
                  </div>
                </label>

                {/* Point Alpha (Yellow) */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="alpha" checked={selectedPoint === 'alpha'} onChange={() => setSelectedPoint('alpha')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#FBBF24] peer-checked:bg-yellow-50 transition-all flex items-center justify-center gap-4 hover:border-yellow-200 shadow-sm">
                    <span className="w-5 h-5 bg-[#FBBF24] rounded-full shrink-0"></span> Point Alpha
                  </div>
                </label>

                {/* Point Beta (Green) */}
                <label className="cursor-pointer group relative">
                  <input type="radio" name="point" value="beta" checked={selectedPoint === 'beta'} onChange={() => setSelectedPoint('beta')} className="peer hidden" />
                  <div className="bg-white px-6 py-6 rounded-[24px] border-2 border-gray-100 text-gray-900 font-medium peer-checked:border-[#A3E635] peer-checked:bg-[#A3E635]/10 transition-all flex items-center justify-center gap-4 hover:border-[#A3E635]/50 shadow-sm">
                    <span className="w-5 h-5 bg-[#A3E635] rounded-full shrink-0"></span> Point Beta
                  </div>
                </label>

                {/* Point Gamma (Green) */}
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
                    : 'bg-[#E5A5A4] text-white/90 cursor-not-allowed' // Колір як на макеті для неактивного стану
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