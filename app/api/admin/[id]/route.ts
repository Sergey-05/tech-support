import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/utils/supabase/user';

export async function POST(req: Request, { params }: { params: { requestId: string } }) {
    const supabase = await createClient();
    const user = await getUserId();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId } = params;
    const { action } = await req.json();
    const now = new Date().toISOString();

    let updatedData: any = { request_finish_time: now };

    if (action === 'accept') {
        updatedData = {
            ...updatedData,
            request_status: 'in_process',
            attached_at: now,
            attached_to: user,
        };
    } else if (action === 'reject') {
        updatedData.request_status = 'canceled';
    } else if (action === 'complete') {
        updatedData.request_status = 'completed';
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabase
        .from('request')
        .update(updatedData)
        .eq('request_id', requestId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: updatedRequest } = await supabase
        .from('request')
        .select('*')
        .eq('request_id', requestId)
        .single();

    return NextResponse.json(updatedRequest, { status: 200 });
}
