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

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
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
        <Skeleton className="h-5 w-36 mb-5" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Recent Bookings</h3>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No bookings found</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-3.5 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="text-sm">
                    {booking.mode === 'driver' ? '🚗' : '🧹'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize truncate">
                    {booking.mode.replace('_', ' ')} — {booking.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  ₹{booking.totalAmount?.toLocaleString() || '0'}
                </p>
                <Badge variant={getStatusVariant(booking.status)} size="sm">
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
