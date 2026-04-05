import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

type Role = 'dispatcher' | 'driver' | 'manager';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState<string>('');

  const roleCredentials: Record<Role, { username: string; password: string }> = {
    dispatcher: { username: 'dispatcher_demo', password: 'demo12345' },
    driver: { username: 'driver_demo', password: 'demo12345' },
    manager: { username: 'manager_demo', password: 'demo12345' },
  };

  const normalizeRole = (backendRole?: string): Role | null => {
    if (!backendRole) return null;
    const map: Record<string, Role> = {
      DISPATCHER: 'dispatcher',
      OPERATOR: 'driver',
      MANAGER: 'manager',
    };
    return map[backendRole] || null;
  };

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError('');

    try {
      const credentials = roleCredentials[role];
      const response = await fetch('/api/proxy/delivery/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const resolvedRole = normalizeRole(data.role) || role;

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', resolvedRole);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('workplaceId', data.workplace_id ? String(data.workplace_id) : '');

      if (resolvedRole === 'dispatcher') {
        router.push('/dashboard');
      } else if (resolvedRole === 'driver') {
        router.push('/trucks');
      } else if (resolvedRole === 'manager') {
        router.push('/stock');
      }
    } catch {
      setError('Unable to sign in. Please seed demo users and try again.');
      setIsLoading(false);
    }
  };

  const roles: { id: Role, title: string, icon: string, description: string }[] = [
    { id: 'dispatcher', title: 'Dispatcher', icon: '🤖', description: 'Monitor hub, manage routes and AI actions' },
    { id: 'driver', title: 'Truck Driver', icon: '🚚', description: 'View assigned tasks and confirm deliveries' },
    { id: 'manager', title: 'Station Manager', icon: '🏭', description: 'Manage local stock and report shortages' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center p-4 font-sans text-gray-900 overflow-hidden">
      <Head>
        <title>Pick Your Role | FlexiRoute</title>
      </Head>

      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-16">
          <span className="text-3xl font-black tracking-tighter mb-4 block">Flexi<span className="text-[#DA291C]">R</span>oute</span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Welcome back</h1>
          <p className="text-gray-500 font-medium text-lg">Pick your role to continue to your workspace</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              disabled={isLoading}
              className={`group bg-white p-10 rounded-[40px] text-left border-2 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col items-start
                ${selectedRole === role.id ? 'border-[#DA291C] scale-95' : 'border-transparent hover:border-[#DA291C]/30'}`}
            >
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-300">
                {role.icon}
              </div>
              <h2 className="text-2xl font-bold mb-3">{role.title}</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                {role.description}
              </p>
              <div className="mt-auto flex items-center gap-2 text-[#DA291C] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Select Role
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm font-semibold text-[#DA291C]">{error}</p>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#DA291C] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-[#DA291C] animate-pulse">Initializing {selectedRole} workspace...</p>
          </div>
        )}
      </div>
    </div>
  );
}
