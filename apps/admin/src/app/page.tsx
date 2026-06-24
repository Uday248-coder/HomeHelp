'use client';

import { useEffect, useState } from 'react';
import type { DashboardStats, Booking } from '@/lib/types';
import { StatCardSkeleton, TableSkeleton } from '@/components/Skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSendOtp = async () => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`OTP sent: ${data.otp}`);
      setOtpSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to verify OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setStats(null);
    setOtpSent(false);
    setPhone('');
    setOtp('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border w-full max-w-sm">
          <h1 className="text-2xl font-bold text-emerald-600 mb-6 text-center">HomeHelp Admin</h1>
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          {!otpSent ? (
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Phone number (e.g. +919876543210)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendOtp}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700"
              >
                Send OTP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">OTP sent to {phone}</p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">HomeHelp Admin</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <TableSkeleton rows={5} cols={5} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">HomeHelp Admin</h1>
          <nav className="flex gap-4 items-center">
            <a href="/" className="text-sm text-emerald-600 font-medium">Dashboard</a>
            <a href="/bookings" className="text-sm text-gray-600 hover:text-emerald-600">Bookings</a>
            <a href="/workers" className="text-sm text-gray-600 hover:text-emerald-600">Workers</a>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 ml-4">Logout</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Active Bookings</p>
            <p className="text-3xl font-bold mt-1">{stats?.activeBookings ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Available Workers</p>
            <p className="text-3xl font-bold mt-1">{stats?.availableWorkers ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Revenue (Today)</p>
            <p className="text-3xl font-bold mt-1">₹{Number(stats?.todayRevenue ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Total Workers</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalWorkers ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-3xl font-bold mt-1">{stats?.totalBookings ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
            <a href="/bookings" className="text-sm text-emerald-600 hover:underline">View all</a>
          </div>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Mode</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b: Booking) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{b.id.slice(0, 8)}...</td>
                      <td className="py-3 pr-4">{b.user?.name || b.user?.phoneNumber || 'N/A'}</td>
                      <td className="py-3 pr-4 capitalize">{b.mode.replace('_', ' ')}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === 'completed' ? 'bg-green-100 text-green-700' :
                          b.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{b.status}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No bookings yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
