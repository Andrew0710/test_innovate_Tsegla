import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Імітація запиту на сервер (затримка 1 секунда)
    setTimeout(() => {
      // Записуємо фейковий токен сесії в браузер
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'dispatcher'); // Можна міняти для різних демо
      
      // Перенаправляємо на захищену сторінку
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4 font-sans text-gray-900">
      <Head>
        <title>Log In | FlexiRoute</title>
      </Head>

      <div className="bg-white w-full max-w-md rounded-[40px] p-10 sm:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
        <h1 className="text-4xl font-extrabold text-center mb-10 tracking-tight">Log In</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="bg-[#F3F4F6] rounded-2xl flex items-center px-5 py-4 focus-within:ring-2 focus-within:ring-[#DA291C]/50 transition-all">
            <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input 
              type="email" 
              placeholder="Email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-gray-700 font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Password Input */}
          <div className="bg-[#F3F4F6] rounded-2xl flex items-center px-5 py-4 focus-within:ring-2 focus-within:ring-[#DA291C]/50 transition-all">
            <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-gray-700 font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#DA291C] hover:bg-red-700 text-white font-bold text-lg py-5 rounded-2xl mt-4 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-red-500/20"
          >
            {isLoading ? 'Logging in...' : (
              <>
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="#" className="text-sm text-gray-500 hover:text-gray-800 underline decoration-gray-300 underline-offset-4 transition-colors font-medium">
            Don't have an account yet? Create one now!
          </Link>
        </div>
      </div>
    </div>
  );
}