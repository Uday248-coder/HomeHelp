'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking, Worker } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function BookingsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignModal, setAssignModal] = useState<Booking | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [assigningWorkers, setAssigningWorkers] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBookings({ page, status: statusFilter || undefined, search: search || undefined }) as { bookings: Booking[]; totalPages: number };
      setBookings(data.bookings || []);
      if (data.totalPages) setTotalPages(data.totalPages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleNavigate = (path: string) => {
    if (path === '/bookings') return;
    router.push(path);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const openAssignModal = async (booking: Booking) => {
    setAssignModal(booking);
    setAssigningWorkers(true);
    try {
      // Pull fresh coords from the booking detail endpoint so the worker list
      // can be sorted by proximity to the customer's address.
      const detail = await api.getBooking(booking.id) as { booking: Booking & { customerLat?: number | null; customerLng?: number | null } };
      const lat = detail.booking?.customerLat;
      const lng = detail.booking?.customerLng;
      const origin = typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : undefined;
      const data = await api.getAvailableWorkers(booking.mode, origin) as { workers: Worker[] };
      setAvailableWorkers(data.workers || []);
    } catch {
      setAvailableWorkers([]);
    } finally {
      setAssigningWorkers(false);
    }
  };

  const handleAssignWorker = async (workerId: string) => {
    if (!assignModal) return;
    try {
      await api.assignWorker(assignModal.id, workerId);
      setAssignModal(null);
      fetchBookings();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to assign worker');
    }
  };

  const handleAction = async (action: 'start' | 'complete' | 'cancel', booking: Booking) => {
    try {
      if (action === 'start') {
        const otpData = await api.generateBookingOtp(booking.id, 'start');
        await api.startBooking(booking.id, otpData.otp);
      } else if (action === 'complete') {
        const otpData = await api.generateBookingOtp(booking.id, 'end');
        await api.completeBooking(booking.id, otpData.otp);
      } else if (action === 'cancel') {
        await api.cancelBooking(booking.id);
      }
      fetchBookings();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Failed to ${action} booking`);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    try {
      await api.markPaymentPaid(paymentId);
      fetchBookings();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to mark payment paid');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/bookings" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8 animate-fade-in">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Bookings Management</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Operational view of all customer requests</p>
              </div>
            </header>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2.5 rounded-lg mb-5 text-sm flex items-center justify-between animate-slide-in">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-medium underline hover:no-underline">Dismiss</button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search by Booking ID or User..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <h3 className="text-sm font-medium text-foreground mb-1">No bookings found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {search || statusFilter
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Bookings will appear here once customers start booking services.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Desktop table (>=768px) — unchanged */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Booking ID</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Assigned Worker</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Created At</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="ops-table-row border-b border-border">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-foreground font-medium">{b.user?.name || b.user?.phoneNumber || 'N/A'}</td>
                          <td className="px-4 py-3 text-foreground">
                            {b.worker?.name || <span className="text-muted-foreground italic text-xs">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-xs text-muted-foreground">{b.mode.replace('_', ' ')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`status-badge status-${b.status}`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground font-medium tabular-nums">
                            {b.payment ? (
                              <div className="flex flex-col gap-1">
                                <span>₹{Number(b.payment.amount).toLocaleString()}</span>
                                <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                  b.payment.status === 'paid' || b.payment.status === 'captured'
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}>
                                  {b.payment.status === 'paid' || b.payment.status === 'captured' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => openAssignModal(b)}
                                  className="px-2 py-1 text-[11px] font-bold text-accent hover:bg-accent/10 rounded transition-colors"
                                >
                                  Assign
                                </button>
                              )}
                              {b.status === 'assigned' && (
                                <button
                                  onClick={() => handleAction('start', b)}
                                  className="px-2 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                >
                                  Start
                                </button>
                              )}
                              {b.status === 'in_progress' && (
                                <button
                                  onClick={() => handleAction('complete', b)}
                                  className="px-2 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {(b.status === 'pending' || b.status === 'assigned') && (
                                <button
                                  onClick={() => handleAction('cancel', b)}
                                  className="px-2 py-1 text-[11px] font-bold text-danger hover:bg-danger/10 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                              {b.payment && b.payment.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkPaid(b.payment!.id)}
                                  className="px-2 py-1 text-[11px] font-bold text-[#1A3C34] hover:bg-[#1A3C34]/10 rounded transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards (<768px) */}
                <div className="block md:hidden divide-y divide-border">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}</p>
                          <p className="text-foreground font-medium mt-0.5">{b.user?.name || b.user?.phoneNumber || 'N/A'}</p>
                        </div>
                        <span className={`status-badge status-${b.status}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Worker</p>
                          <p className="text-foreground">
                            {b.worker?.name || <span className="text-muted-foreground italic">Unassigned</span>}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Mode</p>
                          <p className="text-foreground capitalize">{b.mode.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Amount</p>
                          {b.payment ? (
                            <p className="text-foreground font-medium tabular-nums">
                              ₹{Number(b.payment.amount).toLocaleString()}{' '}
                              <span className={`text-[10px] font-medium uppercase tracking-wider ${
                                b.payment.status === 'paid' || b.payment.status === 'captured'
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                              }`}>
                                {b.payment.status === 'paid' || b.payment.status === 'captured' ? 'Paid' : 'Pending'}
                              </span>
                            </p>
                          ) : (
                            <p className="text-foreground">—</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground uppercase tracking-wider text-[10px] mb-0.5">Created</p>
                          <p className="text-foreground whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => openAssignModal(b)}
                            className="px-3 py-1.5 text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Assign
                          </button>
                        )}
                        {b.status === 'assigned' && (
                          <button
                            onClick={() => handleAction('start', b)}
                            className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Start
                          </button>
                        )}
                        {b.status === 'in_progress' && (
                          <button
                            onClick={() => handleAction('complete', b)}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Complete
                          </button>
                        )}
                        {(b.status === 'pending' || b.status === 'assigned') && (
                          <button
                            onClick={() => handleAction('cancel', b)}
                            className="px-3 py-1.5 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Cancel
                          </button>
                        )}
                        {b.payment && b.payment.status === 'pending' && (
                          <button
                            onClick={() => handleMarkPaid(b.payment!.id)}
                            className="px-3 py-1.5 text-xs font-bold text-[#1A3C34] bg-[#1A3C34]/10 hover:bg-[#1A3C34]/20 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
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
            )}
          </div>
        </ErrorBoundary>
      </main>

      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Worker"
        description="Select a background-verified professional for this booking"
        size="sm"
      >
        {assigningWorkers ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : availableWorkers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No available workers found for this service mode.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
            {availableWorkers.map((w) => (
              <button
                key={w.id}
                onClick={() => handleAssignWorker(w.id)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm">{w.name}</p>
                  {typeof w.distanceKm === 'number' && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">
                      {w.distanceKm.toFixed(1)} km
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {w.phoneNumber} &middot; {w.workerType.replace('_', ' ')} &middot; {Number(w.averageRating).toFixed(1)} rating
                </p>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
