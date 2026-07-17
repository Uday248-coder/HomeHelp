'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Customer, CustomerBooking } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function CustomersPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCustomers({ page, q: search || undefined });
      setCustomers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleNavigate = (path: string) => {
    if (path === '/customers') return;
    router.push(path);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openCustomerDetail = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setBookingsLoading(true);
    try {
      const data = await api.getCustomerBookings(customer.id);
      setCustomerBookings(data.bookings || []);
    } catch {
      setCustomerBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const statusBadge = (status: string): 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral' => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral'> = {
      completed: 'success',
      in_progress: 'info',
      assigned: 'purple',
      cancelled: 'error',
      pending: 'warning',
    };
    return map[status] || 'neutral';
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/customers" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Customers</h1>
                <p className="text-sm text-muted-foreground mt-0.5">View and manage all platform users</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg mb-5 text-sm flex items-center justify-between animate-slide-in">
                <span>{error}</span>
                <button onClick={() => setError('')} className="font-medium underline hover:no-underline">Dismiss</button>
              </div>
            )}

            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-foreground/20"
              />
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              </div>
            ) : customers.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-12 h-12 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-foreground mb-1">No customers found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {search
                      ? 'Try adjusting your search criteria.'
                      : 'Customers will appear here once users register on the platform.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Bookings</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Total Spent</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => openCustomerDetail(c)}
                          className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {c.name || <span className="text-muted-foreground italic">—</span>}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.phoneNumber}</td>
                          <td className="px-4 py-3 text-foreground">
                            {c.email || <span className="text-muted-foreground/50 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="tabular-nums font-medium text-foreground">{c.bookingCount}</span>
                          </td>
                          <td className="px-4 py-3 font-medium tabular-nums text-foreground">
                            ₹{c.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {total} customer{total !== 1 ? 's' : ''}
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
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || selectedCustomer?.phoneNumber || 'Customer Details'}
        description={`Joined ${selectedCustomer ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {selectedCustomer && (
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Phone</p>
                <p className="text-sm text-foreground font-mono mt-0.5">{selectedCustomer.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Email</p>
                <p className="text-sm text-foreground mt-0.5">{selectedCustomer.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                <p className="text-sm text-foreground font-semibold mt-0.5">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Booking History</h4>
            {bookingsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : customerBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin">
                {customerBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={statusBadge(b.status)} size="sm" className="shrink-0">
                        {b.status.replace('_', ' ')}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {b.serviceType} <span className="text-muted-foreground font-normal">· {b.mode.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.worker?.name || 'Unassigned'} · {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-foreground shrink-0 ml-3">
                      {b.payment ? `₹${Number(b.payment.amount).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
