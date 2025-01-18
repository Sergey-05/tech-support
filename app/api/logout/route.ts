// app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/app/lib/actions';
import { redirect } from 'next/navigation';


export async function POST(req: Request) {
  try {
    await logout();
    return NextResponse.redirect('/login')
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
