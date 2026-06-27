'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardStats, WeeklyRevenue } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { BarChart, StatsSummary } from '@/components/Charts';
import { DashboardSkeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginScreen from '@/components/LoginScreen';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<WeeklyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleNavigate = (path: string) => {
    if (path === '/') return;
    router.push(path);
  };

  if (!token) return <LoginScreen />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar currentPath="/" onNavigate={handleNavigate} onLogout={logout} />
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
      <Sidebar currentPath="/" onNavigate={handleNavigate} onLogout={logout} />
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
