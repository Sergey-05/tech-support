// app/api/comments/route.ts
import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {

    // Ожидаем разрешения params
    const { id } = await params;

    const { comment_text, comment_sent_by } = await req.json();

    if (!id || !comment_text) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
  .from('comment')
  .insert([{ request_id: id, comment_text, comment_time: new Date().toISOString(), comment_sent_by }])
  .select('comment_id, comment_text, comment_time, comment_sent_by');


    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data }, { status: 201 });
}
