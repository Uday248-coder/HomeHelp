'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AnalyticsData } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { Skeleton } from '@/components/ui/Skeleton';
import LoginScreen from '@/components/LoginScreen';

function toLocalDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toLocalDateString(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(toLocalDateString(today));

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.getAnalytics({ startDate, endDate });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleNavigate = (path: string) => {
    if (path === '/analytics') return;
    router.push(path);
  };

  const funnelPercent = (count: number) => {
    if (!data) return 0;
    const total = data.bookingFunnel.reduce((s, b) => s + b.count, 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (!token) return <LoginScreen />;

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/analytics" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div>
            <Skeleton className="h-7 w-40 mb-1.5" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 animate-fade-in">
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-6">
            <p className="text-sm text-danger">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Deep dive into platform performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 px-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 px-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Revenue (Period)"
            value={`₹${(data?.totalRevenueThisPeriod || 0).toLocaleString()}`}
            trend={`${data?.dailyRevenue.length || 0} days`}
            color="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Home Help Revenue"
            value={`₹${(data?.modeBreakdown.homeHelp || 0).toLocaleString()}`}
            trend={data && data.modeBreakdown.homeHelp + data.modeBreakdown.driver > 0
              ? `${Math.round((data.modeBreakdown.homeHelp / (data.modeBreakdown.homeHelp + data.modeBreakdown.driver)) * 100)}% of total`
              : 'No data'}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            }
          />
          <StatCard
            title="Driver Revenue"
            value={`₹${(data?.modeBreakdown.driver || 0).toLocaleString()}`}
            trend={data && data.modeBreakdown.homeHelp + data.modeBreakdown.driver > 0
              ? `${Math.round((data.modeBreakdown.driver / (data.modeBreakdown.homeHelp + data.modeBreakdown.driver)) * 100)}% of total`
              : 'No data'}
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            }
          />
        </div>

        <section className="card-dashboard p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Daily Revenue</h2>
          <BarChart data={(data?.dailyRevenue || []).map(d => ({ date: d.date, revenue: d.revenue }))} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="card-dashboard p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Booking Funnel</h2>
            {data && data.bookingFunnel.length > 0 ? (
              <div className="space-y-3">
                {data.bookingFunnel.map((b) => (
                  <div key={b.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">{b.status.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{b.count} ({funnelPercent(b.count)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${funnelPercent(b.count)}%`,
                          backgroundColor:
                            b.status === 'completed' ? '#10b981' :
                            b.status === 'in_progress' ? '#3b82f6' :
                            b.status === 'assigned' ? '#8b5cf6' :
                            b.status === 'cancelled' ? '#ef4444' :
                            '#f59e0b',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No booking data for this period</p>
            )}
          </section>

          <section className="card-dashboard p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Worker Stats</h2>
            {data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{data.workerStats.total}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Active Workers</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{data.workerStats.available}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Currently Available</p>
                  </div>
                </div>

                {data.topWorkers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Performers</h3>
                    <div className="space-y-1.5">
                      {data.topWorkers.map((w, i) => (
                        <div key={w.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{w.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {w.completedJobs} completed · {w.workerType.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-foreground">
                              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {Number(w.averageRating).toFixed(1)}
                            </span>
                            {w.isAvailable && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Available" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No worker data</p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
