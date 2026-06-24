import { NextResponse } from 'next/server';

interface WaitlistEntry {
  email: string;
  createdAt: string;
}

const waitlist: WaitlistEntry[] = [];

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const entry: WaitlistEntry = { email, createdAt: new Date().toISOString() };
    waitlist.push(entry);
    console.log('[Waitlist] New signup:', entry);

    return NextResponse.json({ message: 'Signed up successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to process signup' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ total: waitlist.length, entries: waitlist });
}
