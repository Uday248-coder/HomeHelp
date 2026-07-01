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

  const filteredWorkers = workers.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.phoneNumber.includes(q);
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
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Avg Rating</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider">Total Jobs</th>
                        <th className="px-4 py-3 font-medium text-[11px] uppercase tracking-wider text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((w) => (
                        <tr key={w.id} className="ops-table-row border-b border-border">
                          <td className="px-4 py-3 font-medium text-foreground">{w.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{w.phoneNumber}</td>
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
                            <span className="inline-flex items-center gap-1 text-foreground font-medium">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {Number(w.averageRating).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground text-sm tabular-nums">{w.totalJobs}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleToggleAvailability(w)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                              title={w.isAvailable ? 'Mark as Busy' : 'Mark as Available'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                              </svg>
                            </button>
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
            ) : null}
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
