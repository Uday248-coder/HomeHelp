'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoginScreen from '@/components/LoginScreen';

export default function SettingsPage() {
  const { token, logout, isDark, toggleDark } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path === '/settings') return;
    router.push(path);
  };

  if (!token) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/settings" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your dashboard preferences</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-emerald-600' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">Account</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Sign Out</p>
                      <p className="text-xs text-muted-foreground">Sign out of your admin account</p>
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">API Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">API URL</label>
                    <input
                      type="text"
                      value={process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com'}
                      readOnly
                      className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-sm text-muted-foreground font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
