'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden select-none"
      style={{
        backgroundColor: '#f9f9f9',
        backgroundImage: 'radial-gradient(#000000 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background ambient glow blob */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[32px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main Login Wrapper */}
      <main className="relative z-10 w-full max-w-[480px] flex flex-col items-center py-3 px-2">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 bg-black rounded-[10px] flex items-center justify-center mb-3 shadow-[0_18px_36px_rgba(0,0,0,0.12)]">
            <span className="material-symbols-outlined text-[22px] text-white">terminal</span>
          </div>
          <div className="text-[28px] font-black tracking-[-0.03em] text-black leading-tight">
            Laimsoft
          </div>
          <div
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#5f5e5e] mt-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Technical Command Center
          </div>
        </div>

        {/* Glassmorphic Card */}
        <div
          className="w-full rounded-2xl p-8 sm:p-10 shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-[rgba(226,232,240,0.92)] flex flex-col gap-6"
          style={{
            background: 'rgba(255, 255, 255, 0.76)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-black mb-1">
              Admin Access
            </h2>
            <p className="text-[14px] leading-relaxed text-[#5f5e5e]">
              Enter your credentials to manage infrastructure.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-3 text-[14px] text-[#be123c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Username/Email */}
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-semibold tracking-wider uppercase text-[#5f5e5e] mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Admin Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-0 text-[22px] text-[#7e7576] pointer-events-none">
                  alternate_email
                </span>
                <input
                  type="text"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@laimsoft.io"
                  autoComplete="username"
                  className="w-full py-2.5 pl-7 pr-0 bg-transparent border-b border-[#cfc4c5] text-[15px] text-[#1b1b1b] outline-none focus:border-[#00ff88] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold tracking-wider uppercase text-[#5f5e5e]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Access Token
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-0 text-[22px] text-[#7e7576] pointer-events-none">
                  lock_open
                </span>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full py-2.5 pl-7 pr-0 bg-transparent border-b border-[#cfc4c5] text-[15px] text-[#1b1b1b] outline-none focus:border-[#00ff88] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border border-[#cfc4c5] accent-[#00ff88] cursor-pointer shrink-0"
              />
              <span
                className="text-[14px] text-[#5f5e5e]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Maintain session integrity
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#00ff88] text-black font-semibold rounded-lg text-[16px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-60"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
