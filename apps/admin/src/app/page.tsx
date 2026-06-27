'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import LoginScreen from '@/components/LoginScreen';
import Sidebar from '@/components/Sidebar';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

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
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, revenueData] = await Promise.all([
        api.getDashboard(),
        api.getWeeklyRevenue(),
      ]);

      setStats(statsData);
      setRevenueData(revenueData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <LoginScreen />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar currentPath="/" onNavigate={() => {}} onLogout={() => {}} />
        <main className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar currentPath="/" onNavigate={() => {}} onLogout={() => {}} />
        <main className="flex-1 p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <p className="text-red-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/" onNavigate={() => {}} onLogout={() => {}} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Bookings"
              value={stats?.totalBookings || 0}
              trend="+12%"
              icon="📦"
            />
            <StatCard
              title="Active Workers"
              value={stats?.activeWorkers || 0}
              trend="+5%"
              icon="👥"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              trend="+23%"
              icon="💰"
            />
            <StatCard
              title="Pending"
              value={stats?.pendingBookings || 0}
              trend="Waiting"
              icon="⏳"
              color="amber"
            />
            <StatCard
              title="Completed"
              value={stats?.completedBookings || 0}
              trend="Success"
              icon="✅"
              color="emerald"
            />
            <StatCard
              title="Cancelled"
              value={stats?.cancelledBookings || 0}
              trend="Needs Attention"
              icon="❌"
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Revenue</h3>
              <BarChart data={revenueData} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Booking Status</h3>
              <DonutChart
                data={[
                  { label: 'Pending', value: stats?.pendingBookings || 0, color: '#f59e0b' },
                  { label: 'Completed', value: stats?.completedBookings || 0, color: '#10b981' },
                  { label: 'Cancelled', value: stats?.cancelledBookings || 0, color: '#ef4444' },
                ]}
              />
            </div>
          </div>

          <RecentBookings />
        </div>
      </main>
    </div>
  );
}
