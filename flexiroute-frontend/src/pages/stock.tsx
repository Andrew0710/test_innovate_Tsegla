import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function StockManagement() {
  // --- СТАНИ ФОРМИ ---
  const [qty, setQty] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // --- СТАНИ ДЛЯ BORROW ---
  const [nearbyPoints, setNearbyPoints] = useState([
    { id: 1, name: 'Point Gamma', units: 320, status: 'available' },
    { id: 2, name: 'Point Epsilon', units: 245, status: 'available' }
  ]);
  const [borrowModal, setBorrowModal] = useState<number | null>(null);

  const maxCapacity = 1000;
  // Валідація: кнопка активна тільки якщо число валідне
  const isQtyValid = Number(qty) > 0 && Number(qty) <= maxCapacity;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQtyValid) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setQty('');
      setMessage('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Toast зникає через 3 сек
    }, 1500);
  };

  const confirmBorrow = (id: number) => {
    setNearbyPoints(prev => prev.map(p => p.id === id ? { ...p, status: 'pending' } : p));
    setBorrowModal(null);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans animate-fade-in relative">
      <Head><title>Stock Management | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex flex-col justify-between shrink-0 z-20">
        <div>
          <div className="p-8 pb-12">
            <span className="text-2xl font-black tracking-tighter">Flexi<span className="text-[#DA291C]">R</span>oute</span>
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Link href="/stock" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 font-bold transition-all">
              <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Stock Management
            </Link>
            <Link href="/loading" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Loading
            </Link>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-800 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden shrink-0">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Max" alt="Max Green" className="w-full h-full object-cover" />
          </div>
          <span className="font-medium text-sm text-gray-300">Max Green</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-4 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
              Live
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Stock: Point Delta - Riverside</h1>
          </div>

          {/* STATUS CARD (Top) */}
          <div className="bg-[#FFF8F8] border border-red-200 rounded-[32px] p-8 flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">My Station</p>
              <div className="flex items-center gap-3 mb-10">
                <span className="w-6 h-6 bg-[#DA291C] rounded-full shrink-0 animate-pulse shadow-[0_0_10px_rgba(218,41,28,0.5)]"></span>
                <h2 className="text-2xl font-extrabold text-gray-900">Point Delta - Riverside</h2>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-500">Current Stock</span>
                <span className="text-xl font-extrabold text-gray-900">8 units</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-[#DA291C] h-3 rounded-full" style={{ width: '5%' }}></div>
              </div>
              <span className="text-xs font-bold text-gray-400">2% remaining</span>
            </div>
            
            {/* Right Mini Cards */}
            <div className="flex gap-4 items-center shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Est. stockout
                </p>
                <p className="text-2xl font-extrabold text-gray-900">~ 6h</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm min-w-[140px]">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                  Last delivery
                </p>
                <p className="text-2xl font-extrabold text-gray-900">8h 22m ago</p>
              </div>
            </div>
          </div>

          {/* REPORT FORM CARD */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-[#DA291C]">⚠️</span> Report Urgent Shortage
            </h2>
            
            <form onSubmit={handleSendRequest} className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Requested quantity (units)<span className="text-[#DA291C]">*</span></label>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={(e) => setQty(e.target.value)} 
                  placeholder="e.g. 200" 
                  className={`w-full bg-white border-2 rounded-2xl p-4 text-gray-900 font-medium outline-none transition-all placeholder:text-gray-300 ${qty && !isQtyValid ? 'border-red-400 focus:border-red-500' : 'border-gray-100 focus:border-[#DA291C]'}`}
                />
                {qty && !isQtyValid && <p className="text-[#DA291C] text-xs font-medium mt-2">Maximum capacity is {maxCapacity} units. Minimum is 1.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Message (optional)</label>
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the situation" 
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-gray-900 font-medium outline-none focus:border-[#DA291C] transition-all placeholder:text-gray-300"
                />
              </div>

              <button 
                type="submit" 
                disabled={!isQtyValid || isSubmitting}
                className="w-full bg-[#DA291C] hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-5 rounded-2xl transition-all mt-4 flex justify-center items-center gap-2 shadow-lg shadow-red-500/20 disabled:shadow-none active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg> Send Urgent Request</>
                )}
              </button>
            </form>
          </div>

          {/* NEARBY SURPLUS POINTS CARD */}
          <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 mb-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Nearby Surplus Points
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-8">P2P resource sharing — borrow from nearby points with surplus</p>
            
            <div className="flex flex-col gap-6">
              {nearbyPoints.map(point => (
                <div key={point.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-2">
                  <div>
                    <p className="font-extrabold text-gray-900 text-lg mb-1">{point.name}</p>
                    <p className="text-sm font-medium text-gray-400">{point.units} units available</p>
                  </div>
                  {point.status === 'available' ? (
                    <button 
                      onClick={() => setBorrowModal(point.id)} 
                      className="border-2 border-[#DA291C] text-[#DA291C] hover:bg-red-50 font-bold py-3 px-8 rounded-2xl transition-all active:scale-95 w-full sm:w-auto"
                    >
                      Request Borrow
                    </button>
                  ) : (
                    <span className="text-orange-500 bg-orange-50 px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto border border-orange-100">
                      <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div> 
                      Pending confirmation
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- TOAST MESSAGE --- */}
        <div className={`fixed bottom-10 right-10 bg-gray-900 text-white px-8 py-5 rounded-2xl shadow-2xl transition-all duration-300 transform font-bold z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          ✅ Request Sent to Central Hub
        </div>

        {/* --- MODAL CONFIRMATION --- */}
        {borrowModal && (
          <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl scale-100 transition-transform">
              <h3 className="text-2xl font-extrabold mb-3 text-gray-900">Confirm Request</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">Are you sure you want to request stock from this point? The manager will need to approve.</p>
              <div className="flex gap-3">
                <button onClick={() => setBorrowModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => confirmBorrow(borrowModal)} className="flex-1 bg-[#DA291C] hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red-500/20">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}