import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api, Warehouse, Truck, DeliveryPoint } from '../lib/api';

// --- ІНТЕРФЕЙСИ (ОРИГІНАЛЬНІ) ---
interface Point {
  id: number;
  name: string;
  units: number;
  percentage: number;
  status: 'critical' | 'normal' | 'low';
  updatedAt: string;
  demandRatio: string;
  score: number;
  // Поля для Side Panel
  address?: string;
  manager?: string;
}

interface AIAction {
  id: number;
  truckId: string;
  fromPoint: string;
  toPoint: string;
  priority: 'critical' | 'normal';
  waitTime: string;
  status: 'pending' | 'approving' | 'approved' | 'ignored';
}

export default function Dashboard() {
  const router = useRouter();

  // --- СТАНИ ---
  const [points, setPoints] = useState<Point[]>([]);
  const [actions, setActions] = useState<AIAction[]>([
    { id: 1, truckId: 'T-42', fromPoint: 'Warehouse Beta', toPoint: 'Point Alpha', priority: 'critical', waitTime: '4m', status: 'pending' },
    { id: 2, truckId: 'T-09', fromPoint: 'Point Delta', toPoint: 'Point Epsilon', priority: 'normal', waitTime: '12m', status: 'pending' },
    { id: 3, truckId: 'T-88', fromPoint: 'Central Hub', toPoint: 'Point Gamma', priority: 'normal', waitTime: '1h', status: 'pending' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  // --- ЗАХИСТ МАРШРУТУ (ЛОГІКА ЯКУ ТРЕБА ЗАЛИШИТИ) ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'dispatcher') {
      router.push('/login');
    }
  }, [router]);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ (ІНТЕГРАЦІЯ З БЕКЕНДОМ) ---
  useEffect(() => {
    async function fetchData() {
      try {
        const dData = await api.getDeliveryPoints();
        const mappedPoints: Point[] = dData.map(p => ({
          id: p.id,
          name: p.name,
          units: p.need_capacity,
          percentage: 85, // Mock percentage for original UI design
          status: p.priority_level === 3 ? 'critical' : p.priority_level === 2 ? 'normal' : 'low',
          updatedAt: 'Now',
          demandRatio: 'High',
          score: 8.4,
          address: 'Main St, 12, Lviv',
          manager: 'Ivan Ivanov'
        }));
        setPoints(mappedPoints);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- ЛОГІКА AI ACTIONS ---
  const handleApprove = (id: number) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'approving' } : a));
    setTimeout(() => {
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    }, 1000);
  };

  const handleIgnore = (id: number) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'ignored' } : a));
  };

  // --- УТИЛІТИ ДЛЯ КОЛЬОРІВ (ОРИГІНАЛЬНІ) ---
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'critical': return { border: 'border-[#DA291C]/40', dot: 'bg-[#DA291C]', bg: 'bg-[#DA291C]/5' };
      case 'normal': return { border: 'border-[#FBBF24]/50', dot: 'bg-[#FBBF24]', bg: 'bg-[#FBBF24]/5' };
      case 'low': return { border: 'border-[#A3E635]/50', dot: 'bg-[#A3E635]', bg: 'bg-[#A3E635]/5' };
      default: return { border: 'border-gray-200', dot: 'bg-gray-400', bg: 'bg-white' };
    }
  };

  if (isLoading) return null; // Simple loader or hide while checking auth

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <Head>
        <title>Dashboard | FlexiRoute</title>
      </Head>

      {/* --- SIDEBAR --- */}
      <Sidebar activePage="dashboard" />

      {/* --- MAIN CONTENT (ОРИГІНАЛЬНИЙ) --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 mb-2 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
              Active Monitoring
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Main Dashboard</h1>
          </div>
          <div className="flex gap-3">
             <div className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 flex flex-col items-end">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Fleet Connected</span>
               <span className="text-xl font-black text-gray-900 leading-none">12 Trucks</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN (Map + Cards) */}
          <div className="flex-1 w-full flex flex-col gap-8">
            
            {/* Map Section (Original Design) */}
            <div className="w-full h-[400px] bg-white border border-gray-200 rounded-[32px] overflow-hidden relative shadow-sm group">
              <div className="absolute inset-0 bg-[#f0f2f5] opacity-50" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              
              <div className="absolute top-10 left-10 z-10">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Live Activity</p>
                  <p className="text-xs font-bold text-gray-900 leading-relaxed">High demand detected in <span className="text-[#DA291C]">Central District</span></p>
                </div>
              </div>

              {/* Static dots as in original design */}
              <div className="absolute top-[40%] left-[30%] w-6 h-6 bg-gray-900 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"></div>
              <div className="absolute top-[25%] left-[55%] w-6 h-6 bg-gray-900 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"></div>
              <div className="absolute top-[60%] left-[60%] w-6 h-6 bg-[#DA291C] rounded-full border-4 border-white shadow-lg animate-pulse cursor-pointer hover:scale-125 transition-transform"></div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {points.map(point => {
                const colors = getStatusColors(point.status);
                return (
                  <div 
                    key={point.id} 
                    onClick={() => setSelectedPoint(point)}
                    className={`bg-white rounded-[24px] p-6 border ${colors.border} shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">🕒 {point.updatedAt}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`w-5 h-5 rounded-full ${colors.dot} ${point.status === 'critical' ? 'animate-pulse' : ''}`}></span>
                        <h3 className="font-bold text-gray-900 text-xl">{point.name}</h3>
                      </div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-black text-gray-900 text-2xl">{point.units} <span className="text-sm font-medium text-gray-500">units</span></span>
                        <span className="text-sm text-gray-500 font-bold">{point.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
                        <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${point.percentage}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-semibold border-t border-gray-50 pt-4">
                        <span>Demand: <span className="text-gray-900">{point.demandRatio}</span></span>
                        <span>Score: <span className="text-gray-900">{point.score}</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN (AI Action List) */}
          <div className="w-full xl:w-[420px] bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 shrink-0">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
              <span className="bg-red-50 text-[#DA291C] p-2 rounded-xl">🤖</span> AI Action List
            </h2>

            <div className="flex flex-col gap-5">
              {actions.map(action => (
                <div 
                  key={action.id} 
                  className={`border border-gray-200 rounded-[24px] p-5 bg-white transition-all duration-500 transform
                    ${action.status === 'approving' ? 'opacity-0 translate-x-10 scale-95' : ''} 
                    ${action.status === 'ignored' ? 'opacity-50 grayscale hover:grayscale-0' : 'hover:shadow-md hover:border-[#DA291C]/40'}`}
                >
                  <div className="flex justify-between items-center mb-5">
                    <span className={`w-4 h-4 rounded-full ${action.priority === 'critical' ? 'bg-[#DA291C]' : 'bg-[#A3E635]'}`}></span>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">🕒 {action.waitTime}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-lg mb-4">Redirect {action.truckId}</h4>
                  
                  <div className="flex flex-col gap-2 mb-6 text-sm font-medium relative ml-2">
                    <div className="absolute left-[3px] top-3 bottom-3 w-0.5 bg-gray-200"></div>
                    <div className="flex items-center gap-4 text-gray-400 relative z-10"><span className="w-2 h-2 rounded-full bg-gray-300"></span> {action.fromPoint}</div>
                    <div className="flex items-center gap-4 text-gray-900 relative z-10"><span className="w-2 h-2 rounded-full border-2 border-gray-900 bg-white"></span> {action.toPoint}</div>
                  </div>

                  {action.status === 'pending' || action.status === 'ignored' ? (
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(action.id)} className="flex-1 bg-[#DA291C] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-red-500/20">
                        Approve
                      </button>
                      <button onClick={() => handleIgnore(action.id)} disabled={action.status === 'ignored'} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-3.5 rounded-xl transition-all active:scale-95">
                        Ignore
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-green-50 text-green-600 border border-green-200 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Approved
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- SIDE PANEL --- */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ${selectedPoint ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedPoint && (
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold">{selectedPoint.name}</h2>
                <button onClick={() => setSelectedPoint(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-6">
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-bold text-gray-900 mb-4">{selectedPoint.address}</p>
                <p className="text-sm text-gray-500 mb-1">Manager</p>
                <p className="font-bold text-gray-900">{selectedPoint.manager}</p>
              </div>

              <div className="mt-auto">
                <button onClick={() => setSelectedPoint(null)} className="w-full border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-colors">
                  Close Details
                </button>
              </div>
            </div>
          )}
        </div>
        {selectedPoint && (
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedPoint(null)}></div>
        )}

      </main>
    </div>
  );
}