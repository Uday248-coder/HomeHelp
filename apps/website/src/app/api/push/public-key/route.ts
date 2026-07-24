import { NextResponse } from 'next/server';

// Expose the VAPID public key for use by the browser's PushManager.
// The corresponding private key lives on the backend, never on the
// client bundle (CI secret-guard enforces this).

export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  if (!key) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 });
  }
  return NextResponse.json({ publicKey: key });
}
