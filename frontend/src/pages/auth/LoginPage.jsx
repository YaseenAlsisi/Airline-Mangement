import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login, getMe } from '../../api/auth.api';
import { useTranslation } from 'react-i18next';
import { Squares2X2Icon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, setTokens, setUser } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  let from = location.state?.from?.pathname || '/dashboard';
  if (from === '/') from = '/dashboard';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      const { accessToken, refreshToken } = response.data;
      setTokens(accessToken, refreshToken);

      const meResponse = await getMe();
      setUser(meResponse.data);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a]">
      
      {/* Realistic Airplane/Cloud Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60 mix-blend-luminosity"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop)' }}
      ></div>

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/50 to-[#0f172a]/90"></div>

      {/* Background Dots */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      ></div>
      
      {/* Subtle Blue Glow Effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Logo Icon */}
        <div className="bg-[#f0f4f8] rounded-2xl p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6 transition-transform hover:scale-105 duration-300">
          <Squares2X2Icon className="w-9 h-9 text-[#0f172a]" strokeWidth={2.5} />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-[28px] font-bold text-white tracking-wide mb-2 drop-shadow-md">AAMS Login</h2>
        <p className="text-sm text-gray-300 mb-10 tracking-wider drop-shadow-md">Airline Accounting Management System</p>

        {/* Form Card (Liquid Glassy Effect) */}
        <div className="w-full relative rounded-[2rem] p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Glass background layer */}
          <div className="absolute inset-0 bg-[#0f172a]/30 backdrop-blur-[24px]"></div>
          {/* Inner subtle glow to enhance liquid look */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
          
          <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <div className="text-sm text-red-400 text-center">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl bg-[#0f172a]/50 border border-white/10 py-3.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:outline-none transition-all sm:text-sm shadow-inner"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl bg-[#0f172a]/50 border border-white/10 py-3.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 focus:outline-none transition-all sm:text-sm shadow-inner"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#202c4b] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[#28365a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 transition-all duration-200 ease-in-out active:scale-[0.97] border border-white/10 overflow-hidden"
              >
                {/* Subtle top inner glow for the button to match screenshot */}
                <div className="absolute inset-0 border-t border-white/10 rounded-xl pointer-events-none"></div>
                <span className="relative z-10 tracking-wide">{loading ? 'Signing in...' : 'Sign in'}</span>
                <PaperAirplaneIcon className="relative z-10 w-5 h-5 -rotate-45 text-indigo-300 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};