'use client';

import { API_URL } from '@/lib/config';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface KycStatus {
  identityStatus: 'not_started' | 'pending' | 'in_progress' | 'verified' | 'failed' | 'manual_review' | 'expired';
  licenseStatus: 'not_started' | 'pending' | 'in_progress' | 'verified' | 'failed' | 'manual_review' | 'expired';
  overallStatus: 'not_started' | 'pending' | 'verified' | 'failed' | 'manual_review';
}

export function KycDashboard({ workerType, token, onVerified }: { workerType: string, token: string, onVerified?: () => void }) {
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // License form state
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch KYC status');
      const data = await res.json();
      setStatus(data);
      if (data.overallStatus === 'verified' && onVerified) {
        onVerified();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Check URL for digilocker callback status
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('kyc_status') === 'success') {
      // Clear param and show success
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStatus();
    }
  }, [token]);

  const handleDigiLocker = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/kyc/digilocker/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to start DigiLocker');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleIdentity = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/kyc/identity/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to start identity verification');
      
      // Simulate polling for the mock to complete since we don't have a real UI flow here
      setTimeout(() => {
        fetch(`${API_URL}/api/kyc/identity/status`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => fetchStatus());
        setSubmitting(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const submitLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/kyc/license/start`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dlNumber, dob })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to verify license');
      }
      await fetchStatus();
      setShowLicenseForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-foreground-tertiary">Loading verification status...</div>;
  if (!status) return null;
  
  if (status.overallStatus === 'verified') return null; // Hide if fully verified

  const needsLicense = workerType === 'driver' || workerType === 'both';

  return (
    <div className="mb-8 p-5 rounded-xl border border-border bg-surface">
      <h2 className="font-display text-lg font-medium text-foreground mb-4">Verification Required</h2>
      {error && <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm mb-4">{error}</div>}
      
      <div className="space-y-4">
        {/* Identity Verification */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface-secondary">
          <div>
            <p className="font-medium text-sm text-foreground">Identity Verification (Aadhaar)</p>
            <p className="text-xs text-foreground-tertiary capitalize">Status: {status.identityStatus.replace('_', ' ')}</p>
          </div>
          
          {status.identityStatus !== 'verified' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleDigiLocker} loading={submitting}>Use DigiLocker</Button>
              <Button size="sm" onClick={handleIdentity} loading={submitting}>Verify via OTP</Button>
            </div>
          )}
        </div>

        {/* License Verification */}
        {needsLicense && (
          <div className="flex flex-col p-3 rounded-lg border border-border bg-surface-secondary">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-medium text-sm text-foreground">Driving Licence Verification</p>
                <p className="text-xs text-foreground-tertiary capitalize">Status: {status.licenseStatus.replace('_', ' ')}</p>
              </div>
              {status.licenseStatus !== 'verified' && !showLicenseForm && (
                <Button size="sm" onClick={() => setShowLicenseForm(true)}>Verify License</Button>
              )}
            </div>

            {showLicenseForm && (
              <form onSubmit={submitLicense} className="mt-3 space-y-3 pt-3 border-t border-border">
                <div>
                  <label className="block text-xs font-medium text-foreground-secondary mb-1">DL Number</label>
                  <input type="text" className="input-base text-sm w-full" required
                    placeholder="e.g. MH0420110055555"
                    value={dlNumber} onChange={e => setDlNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-secondary mb-1">Date of Birth</label>
                  <input type="date" className="input-base text-sm w-full" required
                    value={dob} onChange={e => setDob(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowLicenseForm(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={submitting}>Submit for Verification</Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
