'use client';

import { useEffect, useState } from 'react';
import type { Worker } from '@/lib/types';
import { TableSkeleton } from '@/components/Skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/workers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setWorkers(data.workers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (!token) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><a href="/" className="text-emerald-600">Login first</a></div>;
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b"><div className="max-w-7xl mx-auto px-6 py-4"><h1 className="text-xl font-bold text-gray-900">Workers</h1></div></header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border"><TableSkeleton rows={8} cols={8} /></div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Workers</h1>
          <a href="/" className="text-sm text-emerald-600 hover:underline">&larr; Dashboard</a>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aadhaar</th>
                <th className="p-4">License</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w: Worker) => (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{w.name}</td>
                  <td className="p-4 font-mono text-xs">{w.phoneNumber}</td>
                  <td className="p-4 capitalize">{w.workerType.replace('_', ' ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      w.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{w.isAvailable ? 'Available' : 'Busy'}</span>
                  </td>
                  <td className="p-4">{w.aadhaarVerified ? '✅' : '❌'}</td>
                  <td className="p-4">{w.licenseVerified ? '✅' : '❌'}</td>
                  <td className="p-4">{Number(w.averageRating).toFixed(1)}</td>
                  <td className="p-4">{w.totalJobs}</td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No workers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
