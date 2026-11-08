'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PosCredentialItem {
  id: number;
  username: string;
  password: string;
  clientName?: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export default function PosCredentialsClient({
  initialCredentials,
}: {
  initialCredentials: PosCredentialItem[];
}) {
  const router = useRouter();

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [showPassword, setShowPassword] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // UI / Feedback State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<{ [id: number]: boolean }>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<PosCredentialItem | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editLoading, setEditLoading] = useState(false);

  // Generate random secure password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/pos-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          username: username.trim(),
          password: password.trim(),
          clientName: clientName.trim() || null,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessage('POS Credential created successfully.');
        setUsername('');
        setPassword('');
        setClientName('');
        setStatus('active');
        router.refresh();
      } else {
        setError(data.message || 'Could not create POS credential.');
      }
    } catch {
      setError('An unexpected error occurred while creating credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/pos-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status', id }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage(data.message || 'Status updated successfully.');
        router.refresh();
      } else {
        setError(data.message || 'Could not update status.');
      }
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id: number, uname: string) => {
    if (!confirm(`Are you sure you want to delete credentials for "${uname}"? The installer will no longer accept this login.`)) {
      return;
    }

    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/pos-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage('Credential deleted successfully.');
        router.refresh();
      } else {
        setError(data.message || 'Could not delete credential.');
      }
    } catch {
      setError('Failed to delete credential.');
    }
  };

  const openEditModal = (item: PosCredentialItem) => {
    setEditingItem(item);
    setEditPassword(item.password);
    setEditClientName(item.clientName || '');
    setEditStatus(item.status);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/pos-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: editingItem.id,
          password: editPassword.trim(),
          clientName: editClientName.trim() || null,
          status: editStatus,
        }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setMessage('Credential updated successfully.');
        setEditingItem(null);
        router.refresh();
      } else {
        setError(data.message || 'Could not update credential.');
      }
    } catch {
      setError('Failed to update credential.');
    } finally {
      setEditLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered List
  const filtered = initialCredentials.filter((c) => {
    const matchesSearch =
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      (c.clientName && c.clientName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = initialCredentials.length;
  const activeCount = initialCredentials.filter((c) => c.status === 'active').length;
  const inactiveCount = initialCredentials.filter((c) => c.status === 'inactive').length;

  return (
    <div className="space-y-8">
      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Total Licenses
          </div>
          <div className="text-3xl font-bold text-black">{totalCount}</div>
        </div>

        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Active (Can Install)
          </div>
          <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
        </div>

        <div className="bg-white border border-[#e2e2e2] rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Inactive (Blocked)
          </div>
          <div className="text-3xl font-bold text-neutral-600">{inactiveCount}</div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── 2-Column Grid: Left: Create Form | Right: Credentials List ── */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: Add Credentials Card */}
        <section className="bg-white border border-[#e2e2e2] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] h-fit">
          <h2 className="text-[20px] font-semibold text-black mb-1">Create Credentials</h2>
          <p className="text-xs text-[#5f5e5e] mb-5">
            Create installer credentials for a customer.
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="clientName"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Client / Shop Name (Optional)
              </label>
              <input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Al-Madina Supermarket"
                className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 text-sm text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. madina_pos_01"
                className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 text-sm text-black font-mono outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-medium text-black hover:underline cursor-pointer"
                >
                  Generate
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 pr-10 text-sm text-black font-mono outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-black cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Initial Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full border border-[#cfc4c5] rounded-xl px-3.5 py-2.5 text-sm text-black outline-none focus:border-black transition-colors bg-white cursor-pointer"
              >
                <option value="active">Active (Can install)</option>
                <option value="inactive">Inactive (Blocked)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-black text-white rounded-xl text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-60"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {loading ? 'Creating...' : 'Create Credentials'}
            </button>
          </form>
        </section>

        {/* Right: Existing Credentials Table */}
        <section className="bg-white border border-[#e2e2e2] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
          {/* Header & Search / Filters */}
          <div className="border-b border-[#e2e2e2] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold text-black">Installer Credentials</h2>
              <p className="text-xs text-[#5f5e5e]">
                Toggle status to instantly allow or block installations.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search username or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#cfc4c5] rounded-xl px-3 py-1.5 text-xs text-black outline-none focus:border-black transition-colors w-full sm:w-56"
              />

              <select
                aria-label="Filter credentials by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-[#cfc4c5] rounded-xl px-3 py-1.5 text-xs text-black outline-none focus:border-black bg-white cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* List / Table */}
          <div className="overflow-x-auto">
            {filtered.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e2e2] bg-[#fafafa]">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      User / Client
                    </th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Password
                    </th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Status (Click to toggle)
                    </th>
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]">
                  {filtered.map((item) => {
                    const isVisible = !!visiblePasswords[item.id];
                    const isCopied = copiedId === item.id;
                    const isActive = item.status === 'active';

                    return (
                      <tr key={item.id} className="hover:bg-[#fcfcfc] transition-colors">
                        {/* User / Client */}
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-black text-sm">{item.username}</div>
                          {item.clientName && (
                            <div className="text-xs text-[#5f5e5e] mt-0.5">{item.clientName}</div>
                          )}
                        </td>

                        {/* Password */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-[#f4f4f4] px-2 py-1 rounded border border-[#e8e8e8]">
                              {isVisible ? item.password : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(item.id)}
                              title={isVisible ? 'Hide password' : 'Show password'}
                              className="text-neutral-400 hover:text-black cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isVisible ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.password, item.id)}
                              title="Copy password"
                              className="text-neutral-400 hover:text-black cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isCopied ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                              }`}
                            />
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 text-xs text-[#5f5e5e]">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Edit"
                              className="p-1.5 rounded-lg border border-[#cfc4c5] bg-white text-[#1b1b1b] hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.username)}
                              title="Delete"
                              className="p-1.5 rounded-lg border border-[#cfc4c5] bg-white text-[#1b1b1b] hover:bg-[#fff1f2] hover:text-[#be123c] hover:border-[#be123c] transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-[#5f5e5e] text-sm">
                No credentials found. Create your first credential using the form on the left.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Edit Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e2e2]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                Edit Credentials: <span className="font-mono">{editingItem.username}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-neutral-400 hover:text-black cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                  Client / Shop Name
                </label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full border border-[#cfc4c5] rounded-xl px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  required
                  className="w-full border border-[#cfc4c5] rounded-xl px-3 py-2 text-sm text-black font-mono outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#5f5e5e] mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full border border-[#cfc4c5] rounded-xl px-3 py-2 text-sm text-black outline-none focus:border-black bg-white cursor-pointer"
                >
                  <option value="active">Active (Permit Install)</option>
                  <option value="inactive">Inactive (Block Install)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-[#cfc4c5] rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-60 cursor-pointer"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { PosCredentialsClient };
