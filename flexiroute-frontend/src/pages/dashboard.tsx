import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// --- ІНТЕРФЕЙСИ ---
interface PointData {
  id: string;
  name: string;
  updatedAt: string;
  units: number;
  percentage: number;
  demandRatio: string;
  score: number;
  status: 'critical' | 'normal' | 'low';
  address?: string; // Додано для Side Panel
  manager?: string; // Додано для Side Panel
}

interface ActionData {
  id: string;
  truckId: string;
  waitTime: string;
  fromPoint: string;
  toPoint: string;
  status: 'pending' | 'approving' | 'ignored' | 'approved_manual' | 'approved_auto';
  priority: 'critical' | 'low';
}

export default function Dashboard() {
  const router = useRouter();

  // --- СТАНИ ---
  const [points, setPoints] = useState<PointData[]>([]);
  const [actions, setActions] = useState<ActionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Стан для виділеної картки (Side Panel)
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null);

  // --- ЗАХИСТ МАРШРУТУ ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setPoints([
        { id: '1', name: 'Point Delta', address: 'Riverside Ave 12', manager: 'John Doe', updatedAt: '10h 22m ago', units: 8, percentage: 5, demandRatio: '2.7%', score: 19.1, status: 'critical' },
        { id: '2', name: 'Point Alpha', address: 'City Centre, Block B', manager: 'Jane Smith', updatedAt: '10h 22m ago', units: 12, percentage: 2, demandRatio: '2.4%', score: 18.1, status: 'critical' },
        { id: '3', name: 'Point Beta', address: 'Industrial Zone 4', manager: 'Mike Ross', updatedAt: '5h 22m ago', units: 45, percentage: 11, demandRatio: '11%', score: 9.1, status: 'normal' },
      ]);
      setActions([
        { id: 'a1', truckId: 'T-42', waitTime: '3h waiting', fromPoint: 'Point Beta', toPoint: 'Point Alpha', status: 'pending', priority: 'critical' },
        { id: 'a2', truckId: 'T-09', waitTime: '2h waiting', fromPoint: 'Point Gamma', toPoint: 'Point Delta', status: 'pending', priority: 'critical' },
        { id: 'a3', truckId: 'T-51', waitTime: '1h waiting', fromPoint: 'Point Gamma', toPoint: 'Point Zeta', status: 'pending', priority: 'low' },
      ]);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- ЛОГІКА AI ACTION LIST ---
  const handleApprove = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'approving' } : a));
    setTimeout(() => {
      setActions(prev => prev.filter(a => a.id !== id));
    }, 600);
  };

  const handleIgnore = (id: string) => {
    setActions(prev => {
      const target = prev.find(a => a.id === id);
      if (!target) return prev;
      const others = prev.filter(a => a.id !== id);
      return [...others, { ...target, status: 'ignored' }];
    });
  };

  // --- УТИЛІТИ ---
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'critical': return { border: 'border-[#DA291C]/40', dot: 'bg-[#DA291C]', bg: 'bg-[#DA291C]/5' };
      case 'normal': return { border: 'border-[#FBBF24]/50', dot: 'bg-[#FBBF24]', bg: 'bg-[#FBBF24]/5' };
      case 'low': return { border: 'border-[#A3E635]/50', dot: 'bg-[#A3E635]', bg: 'bg-[#A3E635]/5' };
      default: return { border: 'border-gray-200', dot: 'bg-gray-400', bg: 'bg-white' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9]">
        <div className="animate-spin w-10 h-10 border-4 border-[#DA291C] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F7F9] text-gray-900 font-sans overflow-hidden animate-fade-in relative">
      <Head><title>Urgency Hub | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1E1E1E] text-white flex flex-col justify-between shrink-0 z-20 shadow-2xl">
        <div>
          <div className="p-8 pb-12">
            <span className="text-2xl font-black tracking-tighter">Flexi<span className="text-[#DA291C]">R</span>oute</span>
          </div>
          <nav className="flex flex-col gap-2 px-4">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 font-bold transition-all hover:bg-white/20">
              <svg className="w-5 h-5 text-[#DA291C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Urgency Hub
            </Link>
          </nav>
        </div>
        <div 
          className="p-6 border-t border-gray-700 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3" 
          onClick={() => { localStorage.removeItem('isAuthenticated'); router.push('/login'); }}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-medium">Log Out</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 lg:p-12 w-full relative">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-3 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
              System Live
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Urgency Hub</h1>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start relative">
          
          {/* LEFT COLUMN (Map + Cards) */}
          <div className="flex-1 w-full flex flex-col gap-8">
            
            {/* Interactive Map Placeholder */}
            <div className="w-full h-[320px] bg-white border border-gray-200 rounded-[32px] overflow-hidden relative shadow-sm group">
              <div className="absolute inset-0 bg-[#f0f2f5] opacity-50" style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 font-bold uppercase tracking-widest text-sm">Interactive Map Base</div>
              
              {/* Tooltip Truck Example (Дизайнерська вимога) */}
              <div className="absolute top-[30%] left-[20%] group/truck cursor-pointer">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <span className="text-white text-xs">🚚</span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 group-hover/truck:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                  <p className="font-bold mb-1 text-[#DA291C]">Truck T-42</p>
                  <p className="text-gray-300">Fuel: 45% remaining</p>
                  <p className="text-gray-300">Order: Point Alpha (Critical)</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>

              {/* Critical Point Example */}
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

        {/* --- SIDE PANEL (Деталі картки) --- */}
        {/* Відкривається, коли клікаєш на картку (selectedPoint) */}
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
        {/* Темний фон для Side Panel */}
        {selectedPoint && (
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedPoint(null)}></div>
        )}

      </main>
    </div>
  );
}