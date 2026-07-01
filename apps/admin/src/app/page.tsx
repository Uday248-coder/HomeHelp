'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LoginScreen from '@/components/LoginScreen';
import Sidebar from '@/components/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Stats {
  totalBookings: number;
  activeWorkers: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, revenues] = await Promise.all([
        api.getDashboard(),
        api.getWeeklyRevenue(),
      ]);
      setStats(statsData);
      setRevenueData(revenues);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <LoginScreen />;

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/" onNavigate={(path) => router.push(path)} onLogout={logout} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
          <div className="flex justify-between items-end">
            <div>
              <Skeleton className="h-7 w-40 mb-1.5" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
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
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Operations Command Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time overview of HomeHelp ecosystem</p>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={fetchStats}
               className="btn-base btn-secondary text-xs px-3 py-1.5 h-8"
             >
               Refresh Data
             </button>
          </div>
        </header>

        {/* Primary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            trend="+23% vs last month"
            color="emerald"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            trend="+12% vs last month"
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
          />
          <StatCard
            title="Active Workers"
            value={stats?.activeWorkers || 0}
            trend="Current capacity"
            color="purple"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            title="Pending Jobs"
            value={stats?.pendingBookings || 0}
            trend="Action required"
            color="amber"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2 space-y-6">
            <section className="card-dashboard p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-foreground">Revenue Trend</h2>
                <Badge variant="outline" className="text-[10px]">Last 7 Days</Badge>
              </div>
              <BarChart data={revenueData} />
            </section>

            <section className="card-dashboard p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Recent Operational Activity</h2>
              <RecentBookings />
            </section>
          </div>

          {/* Side Ops Panel */}
          <div className="space-y-6">
            <section className="card-dashboard p-6 border-t-4 border-t-accent">
              <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => router.push('/bookings')}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-muted transition-colors text-sm font-medium text-foreground group"
                >
                  <span>Manage Bookings</span>
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button 
                  onClick={() => router.push('/workers')}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-muted transition-colors text-sm font-medium text-foreground group"
                >
                  <span>Verify Workers</span>
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button 
                  onClick={() => router.push('/payouts')}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary hover:bg-muted transition-colors text-sm font-medium text-foreground group"
                >
                  <span>Process Payouts</span>
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </section>

            <section className="card-dashboard p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Booking Distribution</h2>
              <DonutChart
                data={[
                  { label: 'Pending', value: stats?.pendingBookings || 0, color: '#f59e0b' },
                  { label: 'Completed', value: stats?.completedBookings || 0, color: '#10b981' },
                  { label: 'Cancelled', value: stats?.cancelledBookings || 0, color: '#ef4444' },
                ]}
              />
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
