# PROMPT FOR claude.ai WEB CHAT (Sonnet) — Phase 1: Admin Mobile Table Responsiveness

> Copy everything below the line into claude.ai. It has NO repo access, so the real
> source files are pasted inline. Do ONE phase only. Return full updated file contents.

---

You are a senior frontend engineer. I need you to make two admin dashboard tables
responsive on mobile (<768px) in a Next.js 14 + Tailwind CSS v3.4 project. You have
NO access to my filesystem — I am pasting the real current file contents below.
Rewrite each file so that on screens narrower than 768px the table is replaced by a
stacked card layout, while the desktop table (>=768px) stays EXACTLY as-is.

## Constraints / rules
- Framework: Next.js 14 App Router, Tailwind v3.4, React 18. `'use client'` must stay at top.
- Do NOT change any data-fetching logic, API calls, handlers, or imports.
- Do NOT change Tailwind class semantics on desktop. Only ADD responsive behavior.
- Use Tailwind responsive prefixes: `md:` = >=768px. So the table block gets `hidden md:block`
  and the card block gets `block md:hidden`.
- Keep all existing class names used by globals.css (`ops-table-row`, `status-badge`,
  `status-${...}`, `scrollbar-thin`, `bg-card`, `border-border`, `text-foreground`, etc.)
  — they are defined in the project's CSS and must not be renamed.
- Preserve the loading skeleton and empty-state blocks unchanged.
- Keep accessibility: cards should still show all row data; action buttons must remain
  keyboard/touch reachable.
- Return the COMPLETE file for each of the two files, not a diff.

## Acceptance criteria (I will verify these)
1. At >=768px width: table renders exactly as before, no visual change.
2. At <768px width: no horizontal scroll; each booking/worker shows as a card with
   all fields (ID, customer/name, worker, mode, status, amount/rating, actions).
3. All action buttons (Assign/Start/Complete/Cancel/Mark Paid in bookings;
   Verify/Activate/Availability in workers) remain functional in the card view.
4. Loading skeleton and empty states unchanged.
5. `npm run build` (Next lint + typecheck) passes with no new errors.

---

## FILE 1 OF 2 — `apps/admin/src/app/bookings/page.tsx`
(Current full contents — rewrite responsively and return the whole file.)

```tsx
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
import LoginScreen from '@/components/LoginScreen';

export default function BookingsPage() {
  const { token, logout } = useAuth();
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
    if (!token) return;
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
  }, [token, page, statusFilter, search]);

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
      const data = await api.getAvailableWorkers(booking.mode) as { workers: Worker[] };
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

  if (!token) return <LoginScreen />;

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
                <div className="overflow-x-auto scrollbar-thin">
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
                <p className="font-medium text-foreground text-sm">{w.name}</p>
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
```

---

## FILE 2 OF 2 — `apps/admin/src/app/workers/page.tsx`
(Current full contents — rewrite responsively and return the whole file.)

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Worker } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginScreen from '@/components/LoginScreen';

export default function WorkersPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchWorkers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getWorkers({ mode: typeFilter || undefined }) as { workers: Worker[] };
      setWorkers(data.workers || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleNavigate = (path: string) => {
    if (path === '/workers') return;
    router.push(path);
  };

  const handleToggleAvailability = async (worker: Worker) => {
    try {
      await api.updateWorker(worker.id, { isAvailable: !worker.isAvailable });
      fetchWorkers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update worker');
    }
  };

  const handleVerifyAadhaar = async (worker: Worker) => {
    try {
      await api.updateWorker(worker.id, { aadhaarVerified: true });
      fetchWorkers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to verify Aadhaar');
    }
  };

  const handleVerifyLicense = async (worker: Worker) => {
    try {
      await api.updateWorker(worker.id, { licenseVerified: true });
      fetchWorkers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to verify License');
    }
  };

  const handleToggleActive = async (worker: Worker) => {
    try {
      await api.updateWorker(worker.id, { isActive: !worker.isActive });
      fetchWorkers();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update worker status');
    }
  };

  // Mirrors backend policy: Aadhaar for all; License additionally for driving.
  const workerEligibility = (w: Worker): { label: string; tone: 'ok' | 'warn' | 'off' } => {
    if (!w.isActive) return { label: 'Inactive', tone: 'off' };
    if (!w.aadhaarVerified) return { label: 'Needs Aadhaar', tone: 'warn' };
    const canDrive = w.workerType === 'driver' || w.workerType === 'both';
    if (canDrive && !w.licenseVerified) {
      return w.workerType === 'both'
        ? { label: 'Home-help only', tone: 'warn' }
        : { label: 'Needs License', tone: 'warn' };
    }
    return { label: 'Eligible', tone: 'ok' };
  };

  const awaitingVerification = (w: Worker) =>
    !w.aadhaarVerified || ((w.workerType === 'driver' || w.workerType === 'both') && !w.licenseVerified);

  const filteredWorkers = workers.filter((w) => {
    if (search) {
      const q = search.toLowerCase();
      if (!(w.name.toLowerCase().includes(q) || (w.phoneNumber || '').includes(q))) return false;
    }
    if (statusFilter === 'active' && !w.isActive) return false;
    if (statusFilter === 'inactive' && w.isActive) return false;
    if (statusFilter === 'pending' && !awaitingVerification(w)) return false;
    return true;
  });

  if (!token) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/workers" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8 animate-fade-in">
            <header className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Workforce Management</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Monitor and verify your service professionals</p>
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
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
              >
                <option value="">All Service Types</option>
                <option value="home_help">Home Help</option>
                <option value="driver">Driver</option>
                <option value="both">Both</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Archived / Inactive</option>
                <option value="pending">Awaiting Verification</option>
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
            ) : filteredWorkers.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-foreground mb-1">No workers found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {search || typeFilter
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Workers will appear here once they are registered through the website.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Worker Name</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Service Type</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Availability</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Aadhaar</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">License</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Eligibility</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Avg Rating</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Total Jobs</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((w) => (
                        <tr key={w.id} className="ops-table-row border-b border-border">
                          <td className="px-4 py-3 font-medium text-foreground">{w.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.phoneNumber || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant="neutral" size="sm">
                              {w.workerType.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`status-badge ${w.isAvailable ? 'status-active' : 'status-pending'}`}>
                              {w.isAvailable ? 'Available' : 'Busy'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {w.aadhaarVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyAadhaar(w)}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {w.licenseVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyLicense(w)}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {w.isActive ? (
                              <span className="status-badge status-active">Active</span>
                            ) : (
                              <span className="status-badge status-pending" title={w.deactivationReason || undefined}>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const e = workerEligibility(w);
                              const cls = e.tone === 'ok'
                                ? 'text-success'
                                : e.tone === 'warn'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground';
                              return <span className={`text-xs font-medium ${cls}`}>{e.label}</span>;
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-foreground font-medium">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {Number(w.averageRating).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground text-sm tabular-nums">{w.totalJobs}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleActive(w)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                  w.isActive
                                    ? 'text-danger bg-danger/10 hover:bg-danger/20'
                                    : 'text-success bg-success/10 hover:bg-success/20'
                                }`}
                                title={w.isActive ? 'Deactivate worker' : 'Activate worker'}
                              >
                                {w.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleToggleAvailability(w)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                title={w.isAvailable ? 'Mark as Busy' : 'Mark as Available'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredWorkers.length} of {workers.length} worker{workers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
```

---

Return the two complete rewritten files now. Do not write any other code or explanation beyond
briefly noting what you changed in each file.
