import { NextRequest, NextResponse } from 'next/server';

// Forward the browser's push subscription to the backend for persistence.
// The backend is the source of truth so push works whether the user is
// logged in via the website or the mobile app.

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers
      .get('authorization')?.replace(/^Bearer\s+/i, '')
      || request.cookies.get('homehelp_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Sign in required for push notifications' }, { status: 401 });
    }

    const subscription = await request.json();
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[website/api/push/subscribe]', err);
    return NextResponse.json({ error: 'Failed to register subscription' }, { status: 500 });
  }
}
