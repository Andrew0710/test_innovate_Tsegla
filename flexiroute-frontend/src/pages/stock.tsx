import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api, Warehouse, DeliveryPoint } from '../lib/api';

// --- ІНТЕРФЕЙСИ (ОРИГІНАЛЬНІ) ---
interface Point {
  id: number;
  name: string;
  units: number;
  status: 'available' | 'low' | 'pending';
}

export default function StockManagement() {
  const router = useRouter();

  // --- СТАНИ ---
  const [points, setPoints] = useState<DeliveryPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<Point[]>([
    { id: 101, name: 'Warehouse Alpha', units: 450, status: 'available' },
    { id: 102, name: 'Point Gamma', units: 120, status: 'available' },
    { id: 103, name: 'Point Delta', units: 85, status: 'available' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [qty, setQty] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [borrowModal, setBorrowModal] = useState<number | null>(null);

  const maxCapacity = 500;
  const isQtyValid = qty && !isNaN(Number(qty)) && Number(qty) <= maxCapacity && Number(qty) > 0;

  // --- ЗАХИСТ МАРШРУТУ ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'manager') {
      router.push('/login');
    }
  }, [router]);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  useEffect(() => {
    async function fetchData() {
      try {
        const dData = await api.getDeliveryPoints();
        setPoints(dData);
        if (dData.length > 0) setSelectedPoint(dData[0]);
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- ЛОГІКА ФОРМИ ---
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQtyValid) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setQty('');
      setMessage('');
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const confirmBorrow = (id: number) => {
    setNearbyPoints(prev => prev.map(p => p.id === id ? { ...p, status: 'pending' } : p));
    setBorrowModal(null);
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <Head>
        <title>Stock Management | FlexiRoute</title>
      </Head>

      {/* --- SIDEBAR --- */}
      <Sidebar activePage="stock" />

      {/* --- MAIN CONTENT (ОРИГІНАЛЬНИЙ) --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 mb-2 shadow-sm">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
                Monitoring: <span className="text-gray-900 border-b-2 border-[#DA291C] px-1">{selectedPoint?.name || 'Loading...'}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Stock Management</h1>
            </div>
          </div>

          {/* STATS AREA */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Stats Card */}
            <div className="flex-1 bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-bold text-gray-400">Main Storage</h3>
                <span className="text-sm font-bold text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100 animate-pulse">Critical Shortage</span>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-500">Current Stock</span>
                <span className="text-xl font-extrabold text-gray-900">{selectedPoint?.need_capacity || 0} units</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-[#DA291C] h-3 rounded-full transition-all duration-1000" style={{ width: '12%' }}></div>
              </div>
              <span className="text-xs font-bold text-gray-400">12% remaining</span>
            </div>
            
            {/* Right Mini Cards */}
            <div className="flex gap-4 items-center shrink-0 flex-wrap sm:flex-nowrap">
              <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm min-w-[140px] flex-1">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Est. stockout
                </p>
                <p className="text-2xl font-extrabold text-gray-900">~ 6h</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm min-w-[140px] flex-1">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mb-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                  Last delivery
                </p>
                <p className="text-2xl font-extrabold text-gray-900">8h 22m</p>
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
                <button onClick={() => setBorrowModal(null)} className="flex-1 bg-gray-100 hover:bg-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => confirmBorrow(borrowModal)} className="flex-1 bg-[#DA291C] hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red-500/20">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}