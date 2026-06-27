'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';

interface Booking {
  id: string;
  status: string;
  mode: string;
  workerName?: string;
  createdAt: string;
  totalAmount: number;
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.get('/api/bookings/admin/all?page=1&limit=5');
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      pending: 'warning',
      confirmed: 'info',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return variants[status] || 'neutral';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Bookings</h3>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No bookings found</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-lg">
                    {booking.mode === 'driver' ? '🚗' : '🧹'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {booking.mode} - {booking.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ₹{booking.totalAmount?.toLocaleString() || '0'}
                </p>
                <Badge variant={getStatusBadge(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
