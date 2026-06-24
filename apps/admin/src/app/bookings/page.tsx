'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Booking, Worker } from '@/lib/types';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { TableSkeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  assigned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/bookings');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionBooking, setActionBooking] = useState<Booking | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [assignModal, setAssignModal] = useState<Booking | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    setToken(saved);
    const storedDark = localStorage.getItem('admin_dark_mode');
    if (storedDark === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getBookings({ page, status: statusFilter || undefined, search: search || undefined });
      setBookings(data.bookings || data.data || []);
      if (data.totalPages) setTotalPages(data.totalPages);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('admin_dark_mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (path === currentPath) return;
    window.location.href = path;
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
    setAssigning(true);
    try {
      const workers = await api.getAvailableWorkers(booking.mode);
      setAvailableWorkers(workers.workers || workers.data || []);
    } catch {
      setAvailableWorkers([]);
    } finally {
      setAssigning(false);
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

  const handleAction = async (action: string, booking: Booking) => {
    try {
      if (action === 'start') {
        await api.startBooking(booking.id);
      } else if (action === 'complete') {
        await api.completeBooking(booking.id);
      } else if (action === 'cancel') {
        await api.cancelBooking(booking.id);
      }
      fetchBookings();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Failed to ${action} booking`);
    }
    setShowActions(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login first</p>
          <button onClick={() => handleNavigate('/')} className="text-emerald-600 hover:text-emerald-500 font-medium">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} isDark={isDark} onToggleDark={toggleDark} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage all customer bookings</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm flex items-center justify-between">
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
                  type="text"
                  placeholder="Search by ID or user..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <TableSkeleton rows={8} cols={7} />
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-foreground font-medium mb-1">No bookings found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {search || statusFilter
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Bookings will appear here once customers start booking services.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-5 py-3.5 font-medium">ID</th>
                        <th className="px-5 py-3.5 font-medium">User</th>
                        <th className="px-5 py-3.5 font-medium">Worker</th>
                        <th className="px-5 py-3.5 font-medium">Mode</th>
                        <th className="px-5 py-3.5 font-medium">Status</th>
                        <th className="px-5 py-3.5 font-medium">Amount</th>
                        <th className="px-5 py-3.5 font-medium">Date</th>
                        <th className="px-5 py-3.5 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}...</td>
                          <td className="px-5 py-3.5 text-foreground">{b.user?.name || b.user?.phoneNumber || 'N/A'}</td>
                          <td className="px-5 py-3.5 text-foreground">{b.worker?.name || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                          <td className="px-5 py-3.5 capitalize text-foreground">{b.mode.replace('_', ' ')}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || ''}`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-foreground font-medium">
                            {b.payment ? `₹${Number(b.payment.amount).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="relative">
                              <button
                                onClick={() => {
                                  setActionBooking(b);
                                  setShowActions(showActions && actionBooking?.id === b.id ? false : true);
                                }}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              {showActions && actionBooking?.id === b.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-10 py-1">
                                  {b.status === 'pending' && (
                                    <button
                                      onClick={() => { openAssignModal(b); setShowActions(false); }}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      Assign Worker
                                    </button>
                                  )}
                                  {b.status === 'assigned' && (
                                    <button
                                      onClick={() => handleAction('start', b)}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      Generate Start OTP
                                    </button>
                                  )}
                                  {b.status === 'in_progress' && (
                                    <button
                                      onClick={() => handleAction('complete', b)}
                                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                      Generate End OTP
                                    </button>
                                  )}
                                  {(b.status === 'pending' || b.status === 'assigned') && (
                                    <button
                                      onClick={() => handleAction('cancel', b)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                                    >
                                      Cancel Booking
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/30">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>

      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Worker">
        {assigning ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : availableWorkers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No available workers for this service type.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableWorkers.map((w) => (
              <button
                key={w.id}
                onClick={() => handleAssignWorker(w.id)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-emerald-500 hover:bg-muted transition-all"
              >
                <p className="font-medium text-foreground text-sm">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.phoneNumber} · {w.workerType.replace('_', ' ')} · ⭐ {Number(w.averageRating).toFixed(1)}</p>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
