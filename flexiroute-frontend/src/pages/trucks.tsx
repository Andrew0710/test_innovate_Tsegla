import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

// --- ІНТЕРФЕЙСИ ---
interface TruckTask {
  id: string;
  truckId: string;
  route: string;
  distance: number; // Метри для геофенсингу
  priority: 'critical' | 'normal' | 'low';
}

export default function TrucksDriverView() {
  // Стан для активних завдань
  const [activeTasks, setActiveTasks] = useState<TruckTask[]>([
    { id: '1', truckId: 'T-42', route: 'Point Alpha - City Centre', distance: 50, priority: 'critical' }, // < 100m (Unload активна)
    { id: '2', truckId: 'T-09', route: 'Point Delta - Riverside', distance: 850, priority: 'critical' },  // > 100m (Unload заблокована)
    { id: '3', truckId: 'T-56', route: 'Point X - Seaside', distance: 1200, priority: 'normal' },
    { id: '4', truckId: 'T-88', route: 'Point Y - Riverside', distance: 15, priority: 'low' }, // < 100m
  ]);
  
  // Стан для архіву
  const [archivedTasks, setArchivedTasks] = useState<TruckTask[]>([]);

  // Логіка кнопки "Delivered"
  const handleDeliver = (task: TruckTask) => {
    // 1. Видаляємо з активних
    setActiveTasks(prev => prev.filter(t => t.id !== task.id));
    // 2. Додаємо в архів (на початок)
    setArchivedTasks(prev => [{ ...task }, ...prev]);
  };

  // Кольори для бордерів, фону та крапочок згідно макету
  const getStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return { border: 'border-[#DA291C]/50', dot: 'bg-[#DA291C]', bg: 'bg-[#DA291C]/5' };
      case 'normal': return { border: 'border-[#FBBF24]/60', dot: 'bg-[#FBBF24]', bg: 'bg-[#FBBF24]/5' };
      case 'low': return { border: 'border-[#A3E635]/60', dot: 'bg-[#A3E635]', bg: 'bg-[#A3E635]/5' };
      default: return { border: 'border-gray-200', dot: 'bg-gray-400', bg: 'bg-white' };
    }
  };

  return (
    // Дизайнерський пункт 4: Плавна анімація Fade-in для всієї сторінки
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans animate-[fadeIn_0.3s_ease-in-out]">
      <Head><title>Trucks | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <aside className="hidden md:flex w-64 bg-[#1A1A1A] text-white flex-col justify-between shrink-0 z-20">
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
            <Link href="/loading" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Loading
            </Link>
            {/* Активний пункт меню */}
            <Link href="/trucks" className="flex items-center gap-4 px-4 py-3 rounded-xl text-white font-bold transition-all relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
              Trucks
            </Link>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-800 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden shrink-0">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Ruslan" alt="Ruslan Green" className="w-full h-full object-cover" />
          </div>
          <span className="font-medium text-sm text-gray-300">Ruslan Green</span>
        </div>
      </aside>

      {/* --- MAIN CONTENT (Адаптивний) --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Trucks</h1>
          </div>

          {/* ACTIVE TASKS LIST */}
          <div className="flex flex-col gap-6 mb-12">
            {activeTasks.length === 0 && (
              <div className="bg-white p-12 rounded-[32px] border border-gray-200 text-center text-gray-500 font-medium shadow-sm">
                🎉 No active deliveries.
              </div>
            )}
            
            {activeTasks.map(task => {
              // Дизайнерський пункт 3: Геофенсинг (активно лише якщо <= 100м)
              const isNear = task.distance <= 100; 
              const styles = getStyles(task.priority);

              return (
                <div key={task.id} className={`bg-white p-6 md:p-8 rounded-[32px] border-2 ${styles.border} shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden transition-all hover:shadow-md`}>
                  
                  {/* Фоновий градієнт для кольорового ефекту */}
                  <div className={`absolute inset-0 ${styles.bg} opacity-60 pointer-events-none`}></div>
                  
                  {/* Left: Text & Icons */}
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      <span className="font-extrabold text-gray-900 text-xl">{task.truckId}</span>
                      {/* Відладочна інфа про GPS */}
                      <span className="text-xs font-bold text-gray-400">({task.distance}m)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-full ${styles.dot} shrink-0`}></span>
                      <p className="font-medium text-gray-900 text-lg md:text-xl">{task.route}</p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="relative z-10 flex flex-col gap-3 w-full sm:w-[180px] shrink-0">
                    
                    {/* Кнопка Unload */}
                    <button 
                      disabled={!isNear}
                      className={`font-bold py-3.5 px-6 rounded-[20px] transition-all flex items-center justify-center gap-3 text-base w-full
                        ${isNear 
                          ? 'bg-[#DA291C] hover:bg-red-700 text-white shadow-lg shadow-red-500/20 active:scale-[0.98]' 
                          : 'bg-gray-100/80 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                    >
                      {isNear ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      ) : (
                        // Іконка замка, якщо задалеко
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      )}
                      Unload
                    </button>

                    {/* Кнопка Delivered */}
                    <button 
                      onClick={() => handleDeliver(task)} 
                      disabled={!isNear}
                      className={`border-2 font-bold py-3.5 px-6 rounded-[20px] transition-all flex items-center justify-center gap-3 text-base w-full
                        ${isNear 
                          ? 'border-gray-300 text-gray-800 hover:border-gray-900 hover:bg-gray-50 active:scale-[0.98] bg-white' 
                          : 'border-gray-200 text-gray-300 bg-white cursor-not-allowed'}`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Delivered
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

          {/* --- АРХІВ (Дизайнерський пункт 3) --- */}
          {archivedTasks.length > 0 && (
            <div className="animate-[fadeIn_0.5s_ease-in-out]">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-400">Archived Tasks</h2>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="flex flex-col gap-4">
                {archivedTasks.map(task => (
                  <div key={task.id} className="bg-green-50 p-6 md:p-8 rounded-[32px] border border-green-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all">
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4 opacity-60">
                        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        <span className="font-extrabold text-gray-700 text-xl line-through">{task.truckId}</span>
                      </div>
                      <div className="flex items-center gap-4 opacity-60">
                        <span className="w-6 h-6 rounded-full bg-green-400 shrink-0"></span>
                        <p className="font-medium text-gray-700 text-lg md:text-xl line-through">{task.route}</p>
                      </div>
                    </div>

                    <div className="bg-green-500 text-white font-bold py-4 px-8 rounded-[20px] flex items-center justify-center gap-3 shrink-0 w-full sm:w-[180px] shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
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