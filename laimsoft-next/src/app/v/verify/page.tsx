'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, ArrowRight } from 'lucide-react';

export default function CertificateLookupPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) {
      router.push(`/v/${encodeURIComponent(clean)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/5">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400 block mb-2">
          Real-time Verification
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Verify an Official Credential
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto mb-8">
          Enter the unique alphanumeric certificate ID (e.g. <code>8K8YDFLE</code>) found at the bottom of your certificate.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 8K8YDFLE"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Verify
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
