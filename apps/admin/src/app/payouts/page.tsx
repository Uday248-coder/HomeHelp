'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginScreen from '@/components/LoginScreen';
import { api } from '@/lib/api';

interface Payout {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  weekStart: string;
  weekEnd: string;
  paidAt?: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayouts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getPayouts({ page: 1, limit: 20 });
      setPayouts(data.payouts || data.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleNavigate = (path: string) => {
    if (path === '/payouts') return;
    router.push(path);
  };

  const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
      processed: 'success',
      pending: 'warning',
      failed: 'error',
    };
    return map[status] || 'neutral';
  };

  if (!token) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/payouts" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Payouts</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage worker weekly payouts</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg mb-5 text-sm flex items-center justify-between animate-slide-in">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-medium underline hover:no-underline">Dismiss</button>
              </div>
            )}

            {loading ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-foreground mb-1">No payouts yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Payouts will appear here once workers start completing bookings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Worker</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Week</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{p.workerName}</td>
                          <td className="px-4 py-3 text-foreground font-medium tabular-nums">₹{p.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(p.weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(p.weekEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(p.status)} size="sm">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
