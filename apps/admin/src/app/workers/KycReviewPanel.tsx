import React, { useState } from 'react';
import { api } from '@/lib/api';
import type { Worker } from '@/lib/types';

interface KycReviewPanelProps {
  worker: Worker;
  onUpdate: () => void;
}

export function KycReviewPanel({ worker, onUpdate }: KycReviewPanelProps) {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  const handleReview = async (verificationType: string, action: 'approve' | 'reject' | 'request_reverification') => {
    setLoadingType(verificationType);
    setError('');
    try {
      await api.reviewKyc(worker.id, verificationType, action, notes);
      setNotes('');
      onUpdate();
    } catch (e: any) {
      setError(e.message || 'Action failed');
    } finally {
      setLoadingType(null);
    }
  };

  const verifications = worker.kycVerifications || [];
  const identity = verifications.find(v => v.verificationType === 'identity');
  const license = verifications.find(v => v.verificationType === 'driving_licence');

  const requiresLicense = worker.workerType === 'driver' || worker.workerType === 'both';

  return (
    <div className="bg-surface p-4 rounded-xl border border-border">
      <h3 className="text-sm font-semibold mb-3">KYC Document Verification</h3>
      {error && <div className="text-danger text-xs mb-3">{error}</div>}

      <div className="space-y-4">
        {/* Aadhaar Verification */}
        <div className="border border-border/50 rounded-lg p-3 bg-background">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium text-sm">Aadhaar (Identity)</p>
              <p className={`text-xs capitalize ${
                identity?.status === 'verified' ? 'text-success' : 
                identity?.status === 'manual_review' ? 'text-warning' : 'text-muted-foreground'
              }`}>
                Status: {identity?.status?.replace('_', ' ') || 'Not Started'}
              </p>
            </div>
            {identity?.maskedIdentifier && (
              <p className="text-xs font-mono bg-surface-secondary px-2 py-1 rounded">
                {identity.maskedIdentifier}
              </p>
            )}
          </div>
          
          {identity?.status === 'manual_review' && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <input
                type="text"
                placeholder="Review notes (reason for rejection etc.)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border border-border rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  disabled={loadingType === 'identity'}
                  onClick={() => handleReview('identity', 'approve')}
                  className="px-3 py-1 bg-success text-success-foreground text-xs rounded hover:bg-success/90"
                >
                  Approve
                </button>
                <button
                  disabled={loadingType === 'identity'}
                  onClick={() => handleReview('identity', 'reject')}
                  className="px-3 py-1 bg-danger text-danger-foreground text-xs rounded hover:bg-danger/90"
                >
                  Reject
                </button>
                <button
                  disabled={loadingType === 'identity'}
                  onClick={() => handleReview('identity', 'request_reverification')}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 border border-border"
                >
                  Request Re-upload
                </button>
              </div>
            </div>
          )}
        </div>

        {/* License Verification */}
        {requiresLicense && (
          <div className="border border-border/50 rounded-lg p-3 bg-background">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm">Driving Licence</p>
                <p className={`text-xs capitalize ${
                  license?.status === 'verified' ? 'text-success' : 
                  license?.status === 'manual_review' ? 'text-warning' : 'text-muted-foreground'
                }`}>
                  Status: {license?.status?.replace('_', ' ') || 'Not Started'}
                </p>
              </div>
              {license?.maskedIdentifier && (
                <p className="text-xs font-mono bg-surface-secondary px-2 py-1 rounded">
                  {license.maskedIdentifier}
                </p>
              )}
            </div>
            
            {license?.status === 'manual_review' && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <input
                  type="text"
                  placeholder="Review notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-border rounded mb-2"
                />
                <div className="flex gap-2">
                  <button
                    disabled={loadingType === 'driving_licence'}
                    onClick={() => handleReview('driving_licence', 'approve')}
                    className="px-3 py-1 bg-success text-success-foreground text-xs rounded hover:bg-success/90"
                  >
                    Approve
                  </button>
                  <button
                    disabled={loadingType === 'driving_licence'}
                    onClick={() => handleReview('driving_licence', 'reject')}
                    className="px-3 py-1 bg-danger text-danger-foreground text-xs rounded hover:bg-danger/90"
                  >
                    Reject
                  </button>
                  <button
                    disabled={loadingType === 'driving_licence'}
                    onClick={() => handleReview('driving_licence', 'request_reverification')}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/90 border border-border"
                  >
                    Request Re-upload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
