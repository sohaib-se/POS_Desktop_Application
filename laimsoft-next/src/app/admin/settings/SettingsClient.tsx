'use client';

import { useState } from 'react';

interface Props {
  initialAdmin: any;
  initialMail?: any;
}

export default function SettingsClient({ initialAdmin }: Props) {
  const [admin, setAdmin] = useState(initialAdmin || { id: 1, username: 'admin', fullName: '', email: '', createdAt: '' });
  const [profile, setProfile] = useState({
    username: initialAdmin?.username || '',
    fullName: initialAdmin?.fullName || '',
    email: initialAdmin?.email || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [loadingPass, setLoadingPass] = useState<boolean>(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoadingProfile(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'profile', ...profile }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccess(data.message || 'Profile settings updated successfully.');
        setAdmin((prev: any) => ({ ...prev, ...profile }));
      } else {
        setError(data.message || 'Failed to update profile settings.');
      }
    } catch {
      setError('An unexpected error occurred while updating profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (passwords.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoadingPass(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'password',
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccess(data.message || 'Password changed successfully.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to update password.');
      }
    } catch {
      setError('An unexpected error occurred while changing password.');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="max-w-[980px] mx-auto space-y-6">
      {/* ── Page Header (Exact 1:1 PHP settings.php) ── */}
      <div className="mb-6">
        <h1 className="text-[36px] sm:text-[40px] font-bold tracking-tight text-black leading-tight mb-1">
          Settings
        </h1>
        <p className="text-[16px] text-[#5f5e5e]">
          Update your basic admin profile and login credentials.
        </p>
      </div>

      {/* ── Alert Messages (Exact 1:1 PHP settings.php) ── */}
      {success && (
        <div className="rounded-[10px] p-[14px_16px] text-[14px] font-semibold bg-[#e8fff4] text-[#0f5132] border border-[#6ee7b7] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="rounded-[10px] p-[14px_16px] text-[14px] font-semibold bg-[#fff1f2] text-[#9f1239] border border-[#fda4af] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Settings Grid (Exact 1:1 PHP settings.php) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Basic Profile */}
        <section className="bg-white border border-[rgba(207,196,197,0.25)] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-[20px] font-bold text-black mb-1.5">Basic Profile</h2>
          <p className="text-[14px] text-[#5f5e5e] mb-4">Change username and basic account information.</p>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div>
              <label
                htmlFor="full_name"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="inline-flex items-center justify-center gap-2 h-[40px] px-4 rounded-[8px] bg-black text-white text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:shadow-[0_0_14px_rgba(0,255,136,0.35)] active:scale-95 transition-all disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {loadingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Card 2: Security */}
        <section className="bg-white border border-[rgba(207,196,197,0.25)] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
          <h2 className="text-[20px] font-bold text-black mb-1.5">Security</h2>
          <p className="text-[14px] text-[#5f5e5e] mb-4">Change your admin login password securely.</p>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label
                htmlFor="current_password"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Current Password
              </label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                required
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                New Password
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                required
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Confirm New Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full h-[42px] border border-[#cfc4c5] rounded-[8px] bg-white px-3 text-[14px] text-[#1b1b1b] outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPass}
              className="inline-flex items-center justify-center gap-2 h-[40px] px-4 rounded-[8px] bg-black text-white text-[11px] font-bold tracking-[0.1em] uppercase cursor-pointer hover:shadow-[0_0_14px_rgba(0,255,136,0.35)] active:scale-95 transition-all disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              {loadingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Card 3: Account Info (Exact 1:1 PHP settings.php) */}
        <section className="bg-white border border-[rgba(207,196,197,0.25)] rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 lg:col-span-2">
          <h2 className="text-[20px] font-bold text-black mb-1.5">Account Info</h2>
          <p className="text-[14px] text-[#5f5e5e] mb-4">Quick view of your current admin account metadata.</p>

          <div className="grid gap-2.5 mt-1.5">
            <div className="bg-[#f3f3f3] border border-[#cfc4c5] rounded-[8px] p-[10px_12px]">
              <div
                className="text-[10px] uppercase tracking-[0.12em] text-[#5f5e5e] mb-1 font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Admin ID
              </div>
              <div className="text-[14px] text-[#1b1b1b] font-mono">{admin?.id ?? 1}</div>
            </div>

            <div className="bg-[#f3f3f3] border border-[#cfc4c5] rounded-[8px] p-[10px_12px]">
              <div
                className="text-[10px] uppercase tracking-[0.12em] text-[#5f5e5e] mb-1 font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Current Username
              </div>
              <div className="text-[14px] text-[#1b1b1b] font-medium">{admin?.username || 'admin'}</div>
            </div>

            <div className="bg-[#f3f3f3] border border-[#cfc4c5] rounded-[8px] p-[10px_12px]">
              <div
                className="text-[10px] uppercase tracking-[0.12em] text-[#5f5e5e] mb-1 font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Created At
              </div>
              <div className="text-[14px] text-[#1b1b1b]">
                {admin?.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
