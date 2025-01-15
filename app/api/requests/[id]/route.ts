import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения params
    const { id } = await params;

    const supabase = await createClient();

    const { data: requestData, error: requestError } = await supabase
      .from('request')
      .select(
        `
        *,
        attachment (
          attachment_id,
          attachment_name,
          attachment_path
        ),
        comment (
          comment_id,
          comment_text,
          comment_time
        )
      `
      )
      .eq('request_id', id)
      .single();

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 });
    }

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: requestData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
