import { API_URL } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ token: null }, { status: 200 });
    }

    // Verify the token by calling the backend API
    
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ token: null }, { status: 200 });
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ token: null }, { status: 200 });
  }
}