'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DashboardStats, WeeklyRevenue } from '@/lib/types';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { BarChart, StatsSummary } from '@/components/Charts';
import { DashboardSkeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginError, setLoginError] = useState('');
  const [otpDisplay, setOtpDisplay] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);

    const storedDark = localStorage.getItem('admin_dark_mode');
    if (storedDark === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [statsData, revenueData] = await Promise.all([
        api.getDashboard(),
        api.getWeeklyRevenue(),
      ]);
      setStats(statsData);
      setWeeklyRevenue(Array.isArray(revenueData) ? revenueData : revenueData?.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('admin_dark_mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleSendOtp = async () => {
    setLoginError('');
    setOtpDisplay('');
    if (!phone || phone.length < 10) {
      setLoginError('Please enter a valid phone number');
      return;
    }
    setSendingOtp(true);
    try {
      const data = await api.sendOtp(phone);
      setOtpSent(true);
      if (data.otp) setOtpDisplay(`OTP: ${data.otp}`);
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoginError('');
    setVerifyingOtp(true);
    try {
      const data = await api.verifyOtp(phone, otp);
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : 'Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setStats(null);
    setWeeklyRevenue([]);
    setOtpSent(false);
    setPhone('');
    setOtp('');
    setOtpDisplay('');
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (path === '/') return;
    window.location.href = path;
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">HomeHelp Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage operations</p>
          </div>

          {loginError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loginError}
            </div>
          )}

          {otpDisplay && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-lg mb-4 text-sm font-mono text-center">
              {otpDisplay}
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                OTP sent to <span className="font-medium text-foreground">{phone}</span>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOtp()}
                  maxLength={6}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-center font-mono text-lg tracking-widest"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length < 4}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(''); setLoginError(''); setOtpDisplay(''); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change phone number
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar currentPath={currentPath} onNavigate={handleNavigate} isDark={isDark} onToggleDark={toggleDark} onLogout={handleLogout} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  const totalBookings = stats?.recentBookings || [];
  const completedCount = totalBookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = totalBookings.filter((b) => b.status === 'cancelled').length;
  const pendingCount = totalBookings.filter((b) => b.status === 'pending').length;
  const inProgressCount = totalBookings.filter((b) => b.status === 'in_progress' || b.status === 'assigned').length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} isDark={isDark} onToggleDark={toggleDark} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={fetchData} className="font-medium underline hover:no-underline">Retry</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                label="Active Bookings"
                value={stats?.activeBookings ?? 0}
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Available Workers"
                value={stats?.availableWorkers ?? 0}
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Today's Revenue"
                value={`₹${Number(stats?.todayRevenue ?? 0).toLocaleString()}`}
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label="Total Users"
                value={stats?.totalUsers ?? 0}
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
                label="Total Workers"
                value={stats?.totalWorkers ?? 0}
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                label="Total Bookings"
                value={stats?.totalBookings ?? 0}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-6">Weekly Revenue</h2>
                <BarChart data={weeklyRevenue} />
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-6">Booking Status Overview</h2>
                <StatsSummary
                  completed={completedCount}
                  cancelled={cancelledCount}
                  pending={pendingCount}
                  inProgress={inProgressCount}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-base font-semibold text-foreground">Recent Bookings</h2>
                <button
                  onClick={() => handleNavigate('/bookings')}
                  className="text-sm text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              {totalBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-t border-border">
                        <th className="px-6 py-3 font-medium">ID</th>
                        <th className="px-6 py-3 font-medium">User</th>
                        <th className="px-6 py-3 font-medium">Mode</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Amount</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalBookings.slice(0, 10).map((b) => (
                        <tr key={b.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">
                            {b.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-3.5 text-foreground">
                            {b.user?.name || b.user?.phoneNumber || 'N/A'}
                          </td>
                          <td className="px-6 py-3.5 capitalize text-foreground">
                            {b.mode.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                b.status === 'completed'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : b.status === 'in_progress'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : b.status === 'assigned'
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                  : b.status === 'cancelled'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-foreground font-medium">
                            {b.payment ? `₹${Number(b.payment.amount).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-3.5 text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 pb-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-12 h-12 text-muted-foreground/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-muted-foreground text-sm">No bookings yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Bookings will appear here once customers start using the platform.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
