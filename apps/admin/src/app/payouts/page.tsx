'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { TableSkeleton } from '@/components/Skeleton';
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

  if (!token) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/payouts" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage worker weekly payouts</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-medium underline hover:no-underline">Dismiss</button>
              </div>
            )}

            {loading ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <TableSkeleton rows={5} cols={5} />
              </div>
            ) : payouts.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-foreground font-medium mb-1">No payouts yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Payouts will appear here once workers start completing bookings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-5 py-3.5 font-medium">Worker</th>
                        <th className="px-5 py-3.5 font-medium">Amount</th>
                        <th className="px-5 py-3.5 font-medium">Week</th>
                        <th className="px-5 py-3.5 font-medium">Status</th>
                        <th className="px-5 py-3.5 font-medium">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-foreground">{p.workerName}</td>
                          <td className="px-5 py-3.5 text-foreground font-medium">₹{p.amount.toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {new Date(p.weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(p.weekEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              p.status === 'processed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : p.status === 'failed'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
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
