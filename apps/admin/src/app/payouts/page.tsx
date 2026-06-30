'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginScreen from '@/components/LoginScreen';
import { api } from '@/lib/api';

interface Payout {
  id: string;
  workerId: string;
  worker: { id: string; name: string; phoneNumber: string };
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  weekStartDate: string;
  weekEndDate: string;
  processedAt?: string;
  razorpayPayoutId?: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [processModal, setProcessModal] = useState(false);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState<Payout | null>(null);
  const [razorpayId, setRazorpayId] = useState('');

  const fetchPayouts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getPayouts({ page, status: statusFilter || undefined });
      setPayouts(data.payouts || data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleNavigate = (path: string) => {
    if (path === '/payouts') return;
    router.push(path);
  };

  const handleProcessPayouts = async () => {
    if (!weekStart || !weekEnd) return;
    setProcessingPayout(true);
    setError('');
    try {
      await api.processPayouts(weekStart, weekEnd);
      setProcessModal(false);
      setWeekStart('');
      setWeekEnd('');
      fetchPayouts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to process payouts');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!markPaidModal) return;
    try {
      await api.markPayoutPaid(markPaidModal.id, razorpayId || undefined);
      setMarkPaidModal(null);
      setRazorpayId('');
      fetchPayouts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to mark payout as paid');
    }
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
              <button
                onClick={() => setProcessModal(true)}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Process Pending
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg mb-5 text-sm flex items-center justify-between animate-slide-in">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-medium underline hover:no-underline">Dismiss</button>
              </div>
            )}

            <div className="flex gap-3 mb-5">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

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
                    {statusFilter
                      ? 'No payouts match the selected filter.'
                      : 'Click "Process Pending" to generate payouts from completed bookings.'}
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
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{p.worker?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-foreground font-medium tabular-nums">₹{Number(p.amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(p.weekStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(p.weekEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(p.status)} size="sm">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {p.processedAt ? new Date(p.processedAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'pending' && (
                              <button
                                onClick={() => setMarkPaidModal(p)}
                                className="px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {total} payout{total !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Page {page} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>

      <Modal
        isOpen={processModal}
        onClose={() => { setProcessModal(false); setWeekStart(''); setWeekEnd(''); }}
        title="Process Payouts"
        description="Generate payouts for all completed bookings in a date range"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Week Start Date</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Week End Date</label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleProcessPayouts}
            disabled={!weekStart || !weekEnd || processingPayout}
            className="w-full h-9 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {processingPayout && (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {processingPayout ? 'Processing...' : 'Generate Payouts'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!markPaidModal}
        onClose={() => { setMarkPaidModal(null); setRazorpayId(''); }}
        title="Mark Payout as Paid"
        description={markPaidModal ? `${markPaidModal.worker?.name} · ₹${Number(markPaidModal.amount).toLocaleString()}` : ''}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Razorpay Payout ID (optional)</label>
            <input
              type="text"
              value={razorpayId}
              onChange={(e) => setRazorpayId(e.target.value)}
              placeholder="e.g. payout_Jz8x..."
              className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleMarkPaid}
            className="w-full h-9 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Confirm Payment
          </button>
        </div>
      </Modal>
    </div>
  );
}
