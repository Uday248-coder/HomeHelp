'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function SettingsPage() {
  const { logout, isDark, toggleDark } = useAuth();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path === '/settings') return;
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPath="/settings" onNavigate={handleNavigate} onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <div className="p-6 lg:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your dashboard preferences</p>
              </div>
            </div>

            <div className="max-w-lg space-y-5">
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark themes</p>
                  </div>
                  <button
                    onClick={toggleDark}
                    role="switch"
                    aria-checked={isDark}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                      isDark ? 'bg-emerald-600' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        isDark ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4">Account</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sign Out</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sign out of your admin account</p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4">API Configuration</h2>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block font-medium">API URL</label>
                  <div className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-xs text-muted-foreground font-mono flex items-center truncate">
                    {process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com'}
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
