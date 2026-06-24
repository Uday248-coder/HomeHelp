'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Worker } from '@/lib/types';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { TableSkeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
    >
      {label}
    </span>
  );
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [currentPath, setCurrentPath] = useState('/workers');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    setToken(saved);
    const storedDark = localStorage.getItem('admin_dark_mode');
    if (storedDark === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getWorkers({ mode: typeFilter || undefined });
      setWorkers(data.workers || data.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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
    return (
      w.name.toLowerCase().includes(q) ||
      w.phoneNumber.includes(q)
    );
  });

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
                <h1 className="text-2xl font-bold text-foreground">Workers</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your workforce</p>
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
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="home_help">Home Help</option>
                <option value="driver">Driver</option>
                <option value="both">Both</option>
              </select>
            </div>

            {loading ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <TableSkeleton rows={8} cols={8} />
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-muted-foreground/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                  </svg>
                  <h3 className="text-foreground font-medium mb-1">No workers found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    {search || typeFilter
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Workers will appear here once they are registered through the website.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                        <th className="px-5 py-3.5 font-medium">Name</th>
                        <th className="px-5 py-3.5 font-medium">Phone</th>
                        <th className="px-5 py-3.5 font-medium">Type</th>
                        <th className="px-5 py-3.5 font-medium">Availability</th>
                        <th className="px-5 py-3.5 font-medium">Aadhaar</th>
                        <th className="px-5 py-3.5 font-medium">License</th>
                        <th className="px-5 py-3.5 font-medium">Rating</th>
                        <th className="px-5 py-3.5 font-medium">Jobs</th>
                        <th className="px-5 py-3.5 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((w) => (
                        <tr key={w.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-foreground">{w.name}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{w.phoneNumber}</td>
                          <td className="px-5 py-3.5 capitalize text-foreground">
                            <Badge active label={w.workerType.replace('_', ' ')} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleToggleAvailability(w)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                w.isAvailable
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${w.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {w.isAvailable ? 'Available' : 'Busy'}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            {w.aadhaarVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyAadhaar(w)}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {w.licenseVerified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyLicense(w)}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                              >
                                Verify
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-foreground font-medium">
                              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {Number(w.averageRating).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-foreground">{w.totalJobs}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleToggleAvailability(w)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                title={w.isAvailable ? 'Mark as Busy' : 'Mark as Available'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground">
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
