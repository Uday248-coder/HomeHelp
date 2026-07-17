'use client';

import { useAuth } from '@/lib/auth-context';
import LoginScreen from '@/components/LoginScreen';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // While /api/auth/me is in flight, show a neutral skeleton so we never
  // briefly flash the login form for a valid (and admin) session.
  if (user === undefined) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }

  if (!user) return <LoginScreen />;

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-dashboard p-8 text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Access denied</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This dashboard is restricted to administrators. Contact the owner if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
