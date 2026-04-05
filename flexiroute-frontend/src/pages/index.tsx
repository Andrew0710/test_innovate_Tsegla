import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  // Логіка для мобільного меню
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-red-100 overflow-x-hidden scroll-smooth">
      <Head>
        <title>FlexiRoute | Streamline Your Transport Operations</title>
      </Head>

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-black tracking-tighter">
              Flexi<span className="text-[#DA291C]">R</span>oute
            </Link>
          </div>
          
          {/* Навігація для десктопа (hidden на мобільних) */}
          <nav className="hidden md:flex gap-10 text-base font-semibold text-gray-600">
            <a href="#about" className="hover:text-[#DA291C] transition-colors py-2">About Us</a>
            <a href="#pricing" className="hover:text-[#DA291C] transition-colors py-2">Pricing</a>
            <a href="#contacts" className="hover:text-[#DA291C] transition-colors py-2">Contacts</a>
          </nav>

          <div className="flex gap-4 items-center">
            <Link href="/login" className="bg-[#DA291C] hover:bg-red-700 text-white text-base font-bold py-3.5 px-8 rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95">
              Log In
            </Link>
            
            {/* Кнопка бургера для мобільних */}
            <button 
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Мобільне меню (показується при isMenuOpen) */}
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 shadow-lg">
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-gray-600 py-2">About Us</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-gray-600 py-2">Pricing</a>
            <a href="#contacts" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-gray-600 py-2">Contacts</a>
          </nav>
        )}
      </header>

      {/* Відступ, щоб контент не ховався під фіксований хедер */}
      <div className="h-24"></div>

      {/* --- HERO SECTION --- */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        <div className="w-full md:w-[55%] lg:w-[60%] z-10 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-[60px] lg:text-[72px] font-extrabold tracking-tighter leading-[1.05] mb-6 text-gray-900">
            Streamline Your <br className="hidden md:block"/> Transport Operations
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed font-medium mx-auto md:mx-0">
            FlexiRoute gives you complete visibility and control over your logistics network. Reduce costs, improve delivery times, and scale your operations with confidence.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-3 bg-[#DA291C] hover:bg-red-700 text-white font-bold py-4 sm:py-5 px-10 rounded-2xl transition-all hover:shadow-xl hover:shadow-red-500/30 text-lg sm:text-xl w-full sm:w-auto active:scale-95">
            Get Started
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="w-full md:w-[45%] lg:w-[40%] flex justify-center md:justify-end relative mt-10 md:mt-0">
          <img 
            src="/truck.png" 
            alt="Logistics 3D Truck" 
            className="w-full max-w-[400px] lg:max-w-[550px] object-contain drop-shadow-2xl md:scale-110 lg:scale-125 md:origin-right" 
          />
        </div>
      </section>

      {/* --- CHALLENGES SECTION (About Us) --- */}
      <section id="about" className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <p className="text-xl text-gray-600 mb-2 font-medium">Challenges</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold mb-12 sm:mb-16 leading-[1.1] tracking-tight">
          Facing Transport Companies <br className="hidden md:block"/> Today
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="border border-gray-100 rounded-[32px] p-8 sm:p-10 hover:shadow-xl transition-all duration-300 bg-white">
            <div className="w-16 h-16 bg-[#DA291C] rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-red-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Delayed Shipments</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">Poor route planning and lack of real-time tracking leads to missed delivery windows and unhappy customers.</p>
          </div>
          {/* Card 2 */}
          <div className="border border-gray-100 rounded-[32px] p-8 sm:p-10 hover:shadow-xl transition-all duration-300 bg-white">
            <div className="w-16 h-16 bg-[#DA291C] rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-red-500/30">
              <span className="font-extrabold text-3xl">$</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Rising Costs</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">Inefficient operations, fuel waste, and manual processes drain your profit margins every single day.</p>
          </div>
          {/* Card 3 */}
          <div className="border border-gray-100 rounded-[32px] p-8 sm:p-10 hover:shadow-xl transition-all duration-300 bg-white">
            <div className="w-16 h-16 bg-[#DA291C] rounded-full flex items-center justify-center text-white mb-8 shadow-lg shadow-red-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Fleet Underutilization</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">Without data-driven insights, vehicles sit idle while others are overworked, reducing overall efficiency.</p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION (Pricing Placeholder) --- */}
      <section id="pricing" className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-24">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold mb-12 sm:mb-16 tracking-tight">
          How <span className="font-normal text-gray-400">FlexiRoute</span> Works?
        </h2>
        
        <div className="flex flex-col md:flex-row gap-10 sm:gap-12 items-start relative">
          {/* Step 1 */}
          <div className="flex-1 relative group w-full">
            <div className="w-14 h-14 bg-[#DA291C] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-red-500/30">1</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Connect Your Fleet</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed md:pr-6 font-medium">Integrate your vehicles, drivers, and existing systems in minutes. No complex setup required.</p>
            {/* Arrow */}
            <svg className="hidden md:block absolute top-7 right-0 w-8 h-8 text-gray-300 translate-x-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
          {/* Step 2 */}
          <div className="flex-1 relative group w-full">
            <div className="w-14 h-14 bg-[#DA291C] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-red-500/30">2</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Optimize Routes</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed md:pr-6 font-medium">AI-powered algorithms analyze traffic, delivery priorities, and vehicle capacity to create optimal routes.</p>
            {/* Arrow */}
            <svg className="hidden md:block absolute top-7 right-0 w-8 h-8 text-gray-300 translate-x-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
          {/* Step 3 */}
          <div className="flex-1 group w-full">
            <div className="w-14 h-14 bg-[#DA291C] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-lg shadow-red-500/30">3</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Track & Improve</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed md:pr-6 font-medium">Monitor deliveries in real-time and gain actionable insights to continuously improve performance.</p>
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="bg-[#DA291C] rounded-[40px] p-8 sm:p-12 lg:p-16 flex flex-col justify-between gap-8 sm:gap-10 shadow-2xl shadow-red-500/20 relative overflow-hidden">
          
          <div className="text-white max-w-2xl relative z-10 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight">Ready to Transform Your Logistics?</h2>
            <p className="text-red-100 text-base sm:text-lg lg:text-xl font-medium max-w-xl mx-auto sm:mx-0">Join hundreds of transport companies already using FlexiRoute to cut costs and improve delivery performance.</p>
          </div>
          
          <div className="relative z-10 flex justify-center sm:justify-start">
            <Link href="/dashboard" className="bg-white text-gray-900 hover:bg-gray-50 font-bold py-4 sm:py-5 px-8 sm:px-10 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg w-full sm:w-auto active:scale-95">
              Get Started
              <svg className="w-6 h-6 text-[#DA291C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER (Contacts) --- */}
      <footer id="contacts" className="bg-white border-t border-gray-100 mt-8 sm:mt-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 flex flex-col sm:flex-row justify-between items-start gap-10">
          <div>
            <h4 className="font-extrabold text-gray-900 text-lg mb-4 sm:mb-6">Our Contacts:</h4>
            <div className="flex flex-col gap-3 sm:gap-4 text-base text-gray-600 font-medium">
              <p className="flex items-center gap-3"><span className="text-gray-400">✉️</span>  tseglateam@gmail.com</p>
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-lg mb-4 sm:mb-6">Follow Us:</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-[#DA291C] hover:text-white transition-colors cursor-pointer font-bold text-base active:scale-95">In</div>
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-[#DA291C] hover:text-white transition-colors cursor-pointer font-bold text-base active:scale-95">Fb</div>
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-[#DA291C] hover:text-white transition-colors cursor-pointer font-bold text-base active:scale-95">Tg</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}