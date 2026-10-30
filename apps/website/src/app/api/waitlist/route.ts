import { API_URL } from '@/lib/config';
import { NextResponse } from 'next/server';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to process signup' }, { status: 500 });
  }
}
