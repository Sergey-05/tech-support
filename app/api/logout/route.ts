// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { logout } from '@/app/lib/actions';


export async function POST() {
  try {
    await logout();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
