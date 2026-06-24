'use client';

import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/types';
import { TableSkeleton } from '@/components/Skeleton';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/bookings/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setBookings(data.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (!token) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><a href="/" className="text-emerald-600">Login first</a></div>;
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b"><div className="max-w-7xl mx-auto px-6 py-4"><h1 className="text-xl font-bold text-gray-900">Bookings</h1></div></header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border"><TableSkeleton rows={8} cols={7} /></div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
          <a href="/" className="text-sm text-emerald-600 hover:underline">&larr; Dashboard</a>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="p-4">ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Worker</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Booking) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">{b.id.slice(0, 8)}...</td>
                  <td className="p-4">{b.user?.name || b.user?.phoneNumber || 'N/A'}</td>
                  <td className="p-4">{b.worker?.name || 'Unassigned'}</td>
                  <td className="p-4 capitalize">{b.mode.replace('_', ' ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'assigned' ? 'bg-purple-100 text-purple-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{b.status}</span>
                  </td>
                  <td className="p-4">{b.payment ? `₹${Number(b.payment.amount)}` : '—'}</td>
                  <td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
