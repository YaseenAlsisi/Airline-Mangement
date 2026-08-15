import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { login, getMe } from '../../api/auth.api';
import { useTranslation } from 'react-i18next';
import { RectangleGroupIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
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

  const starStyle = {
    backgroundImage: `
      radial-gradient(1px 1px at 15% 30%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1.5px 1.5px at 45% 75%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,1), transparent),
      radial-gradient(2px 2px at 85% 65%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.8), transparent)
    `,
    backgroundSize: '120px 120px'
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[#0B1121] relative overflow-hidden font-sans">
      
      {/* Background Airplane Watermark matching the Sidebar */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-60"
        style={{
          backgroundImage: 'url("/airplane-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(3)', // Massive scale to completely eliminate baked-in image borders
          transformOrigin: 'bottom center', // Keep the airplane at the bottom while scaling
        }}
      />

      {/* Starry Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen opacity-50"
        style={starStyle}
      />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#fdfbf6] p-4 rounded-2xl shadow-lg flex items-center justify-center">
            <RectangleGroupIcon className="w-10 h-10 text-[#0B1121]" strokeWidth={2} />
          </div>
        </div>
        
        <h2 className="mt-2 text-center text-3xl font-extrabold leading-9 tracking-tight text-white">
          AAMS Login
        </h2>
        <p className="text-center text-indigo-200 mt-2 text-sm">
          Airline Accounting Management System
        </p>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Glassy Card */}
        <div className="bg-[#1e2e4f]/40 backdrop-blur-xl border border-[#273b66]/50 py-10 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] sm:rounded-[32px] sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/50 p-4">
                <div className="text-sm font-medium text-red-400 text-center">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-indigo-100">
                {t('login.username')}
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-indigo-300/50 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 transition-all outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-indigo-100">
                  {t('login.password')}
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-indigo-300/50 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#152038] via-[#1e2e4f] to-[#273b66] px-4 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] shadow-lg shadow-[#0B1121]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#1e2e4f]/60 active:scale-[0.98] border border-[#273b66]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 tracking-wider">
                  {loading ? t('login.signingIn') : t('login.signIn')}
                </span>
                {!loading && <PaperAirplaneIcon className="relative z-10 w-5 h-5 text-indigo-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};