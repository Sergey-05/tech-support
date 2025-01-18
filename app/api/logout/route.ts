// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { logout } from '@/app/lib/actions';
import { redirect } from 'next/navigation';


export async function POST() {
  try {
    await logout();
    redirect('/login');
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
