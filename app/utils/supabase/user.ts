// app/utils/supabase/server/user.ts
'use server';

import { createClient } from './server';
import { NextResponse } from 'next/server';

export async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
} = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userDetails, error } = await supabase
    .from('user')
    .select('user_id')
    .eq('user_uuid', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (!userDetails || !userDetails.user_id) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
  }

  return userDetails.user_id;
}

export async function getUserDetails(userId: string) {
  const supabase = await createClient();

  const { data: userDetails, error } = await supabase
    .from('user')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return userDetails;
}
