import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface SidebarProps {
  activePage: 'dashboard' | 'stock' | 'loading' | 'trucks';
}

export default function Sidebar({ activePage }: SidebarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

  const navLinks = [
    { href: '/dashboard', label: 'Urgency Hub', id: 'dashboard', roles: ['dispatcher'], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { href: '/stock', label: 'Stock Management', id: 'stock', roles: ['manager'], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    )},
    { href: '/loading', label: 'Loading', id: 'loading', roles: ['dispatcher'], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
    )},
    { href: '/trucks', label: 'Trucks', id: 'trucks', roles: ['driver'], icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    )}
  ];

  const filteredLinks = navLinks.filter(link => userRole && link.roles.includes(userRole));

  const roleLabels: Record<string, string> = {
    dispatcher: 'Dispatcher',
    manager: 'Station Manager',
    driver: 'Truck Driver'
  };

  return (
    <>
      <header className="md:hidden w-full bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#DA291C] text-white flex items-center justify-center font-black">R</div>
          <span className="text-base font-bold text-gray-900">FlexiRoute</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-800"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative h-full w-72 bg-[#1A1A1A] text-white p-5 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-black tracking-tighter">Flexi<span className="text-[#DA291C]">R</span>oute</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2 mb-6">
              {filteredLinks.map(link => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activePage === link.id ? 'bg-white/10 font-bold' : 'text-gray-300 hover:text-white hover:bg-white/5 font-medium'}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { localStorage.clear(); router.push('/login'); setIsMobileMenuOpen(false); }}>
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="font-medium text-sm text-gray-300">Log Out</span>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-64 bg-[#1A1A1A] text-white flex-col justify-between shrink-0 z-20 shadow-xl">
      <div>
        <div className="p-8 pb-12">
          <span className="text-2xl font-black tracking-tighter">Flexi<span className="text-[#DA291C]">R</span>oute</span>
        </div>
        
        {/* ROLE DISPLAY & SWITCHER */}
        <div className="px-6 mb-8 text-xs font-bold flex flex-col gap-3">
          <span className="text-gray-500 uppercase tracking-widest">Active Persona</span>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-white text-sm font-extrabold">{userRole ? roleLabels[userRole] : 'Unknown'}</span>
            <button 
              onClick={() => router.push('/login')}
              className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Switch Persona
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          {filteredLinks.map(link => (
            <Link 
              key={link.id} 
              href={link.href} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activePage === link.id ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div 
        className="p-6 border-t border-gray-800 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => { localStorage.clear(); router.push('/login'); }}
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        <span className="font-medium text-sm text-gray-300">Log Out</span>
      </div>
    </aside>
    </>
  );
}
