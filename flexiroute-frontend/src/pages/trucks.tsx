import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';

// --- ІНТЕРФЕЙСИ (ОРИГІНАЛЬНІ) ---
interface TruckTask {
  id: number;
  quantity: number;
  truckId: string;
  route: string;
  distance: number;
  priority: 'critical' | 'normal' | 'low';
}

export default function DriverInterface() {
  const router = useRouter();

  // --- СТАНИ ---
  const [activeTasks, setActiveTasks] = useState<TruckTask[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<TruckTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ЗАХИСТ МАРШРУТУ ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'driver') {
      router.push('/login');
    }
  }, [router]);

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [dPoints, orders] = await Promise.all([
          api.getDeliveryPoints(),
          api.getOrders(),
        ]);
        
        const liveOrders = orders.filter((order) => order.status === 'LOADING');
        const mappedTasks: TruckTask[] = liveOrders.map((order, i) => {
          const point = dPoints.find((p) => p.id === order.delivery_point);
          return {
            id: order.id,
            quantity: order.quantity,
            truckId: i === 0 ? 'T-42 (Your Truck)' : `T-${40 + i}`,
            route: `Go to ${point?.name || `Point #${order.delivery_point}`}`,
            distance: 15 + i * 40,
            priority: order.urgency_level === 3 ? 'critical' : order.urgency_level === 2 ? 'normal' : 'low',
          };
        });

        setActiveTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to fetch driver data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Логіка кнопки "Delivered"
  const handleDeliver = async (task: TruckTask) => {
    try {
      await api.fulfillOrder(task.id, task.quantity);
      setActiveTasks(prev => prev.filter(t => t.id !== task.id));
      setArchivedTasks(prev => [{ ...task }, ...prev]);
    } catch (error) {
      console.error('Failed to fulfill order:', error);
    }
  };

  // Кольори для бордерів, фону та крапочок (ОРИГІНАЛЬНІ)
  const getStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return { border: 'border-[#DA291C]/50', dot: 'bg-[#DA291C]', bg: 'bg-[#DA291C]/5' };
      case 'normal': return { border: 'border-[#FBBF24]/60', dot: 'bg-[#FBBF24]', bg: 'bg-[#FBBF24]/5' };
      case 'low': return { border: 'border-[#A3E635]/60', dot: 'bg-[#A3E635]', bg: 'bg-[#A3E635]/5' };
      default: return { border: 'border-gray-200', dot: 'bg-gray-400', bg: 'bg-white' };
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <Head><title>Trucks | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <Sidebar activePage="trucks" />

      {/* --- MAIN CONTENT (ОРИГІНАЛЬНИЙ) --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          <header>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Driver Interface</h1>
          </header>

          {/* ACTIVE TASKS LIST */}
          <div className="flex flex-col gap-6 mb-12">
            {activeTasks.length === 0 && (
              <div className="bg-white p-12 rounded-[32px] border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                🎉 No active deliveries.
              </div>
            )}
            
            {activeTasks.map(task => {
              const isNear = task.distance <= 100; 
              const styles = getStyles(task.priority);

              return (
                <div key={task.id} className={`bg-white p-6 md:p-8 rounded-[32px] border-2 ${styles.border} shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden transition-all hover:shadow-md`}>
                  <div className={`absolute inset-0 ${styles.bg} opacity-60 pointer-events-none`}></div>
                  
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      <span className="font-extrabold text-gray-900 text-xl">{task.truckId}</span>
                      <span className="text-xs font-bold text-gray-400">({task.distance}m)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-full ${styles.dot} shrink-0`}></span>
                      <p className="font-medium text-gray-900 text-lg md:text-xl">{task.route}</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-3 w-full sm:w-[180px] shrink-0">
                    <div 
                      className={`font-bold py-3.5 px-6 rounded-[20px] text-base w-full text-center border
                        ${isNear 
                          ? 'bg-red-50 text-[#DA291C] border-red-200' 
                          : 'bg-gray-100/80 text-gray-400 border-gray-200'}`}
                    >
                      {isNear ? 'At Delivery Zone' : 'Too Far'}
                    </div>
                    <button 
                      onClick={() => handleDeliver(task)} 
                      disabled={!isNear}
                      className={`border-2 font-bold py-3.5 px-6 rounded-[20px] transition-all flex items-center justify-center gap-3 text-base w-full
                        ${isNear 
                          ? 'border-gray-300 text-gray-800 hover:border-gray-900 hover:bg-gray-50 active:scale-[0.98] bg-white' 
                          : 'border-gray-200 text-gray-300 bg-white cursor-not-allowed'}`}
                    >
                      Delivered
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ARCHIVE */}
          {archivedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-400">Archived Tasks</h2>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              <div className="flex flex-col gap-4">
                {archivedTasks.map(task => (
                  <div key={task.id} className="bg-green-50 p-6 md:p-8 rounded-[32px] border border-green-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 opacity-80">
                    <div className="flex flex-col gap-3">
                      <p className="font-extrabold text-gray-700 text-xl line-through">{task.truckId}</p>
                      <p className="font-medium text-gray-700 text-lg line-through">{task.route}</p>
                    </div>
                    <div className="bg-green-500 text-white font-bold py-4 px-8 rounded-[20px] flex items-center justify-center gap-3 shrink-0">
                      Done
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}