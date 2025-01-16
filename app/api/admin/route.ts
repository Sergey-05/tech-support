import { createClient } from '../../utils/supabase/server';
import { NextResponse } from 'next/server';
import { getUserId } from '@/app/utils/supabase/user';

export async function GET(req: Response) {
    const supabase = await createClient();

    const user = await getUserId();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Запрос для заявок со статусом "new"
    const { data: newRequests, error: newRequestsError } = await supabase
        .from('request')
        .select(`
            request_id,
            request_head,
            request_descr,
            request_status,
            request_date,
            request_time_left,
            category:category_id (category_name),
            user:user_id (user_fullname, user_email)
        `)
        .eq('request_status', 'new');

    if (newRequestsError) {
        return NextResponse.json({ error: newRequestsError.message }, { status: 500 });
    }

    // Запрос для заявок со статусом "in_process", привязанных к текущему пользователю
    const { data: inProcessRequests, error: inProcessRequestsError } = await supabase
        .from('request')
        .select(`
            request_id,
            request_head,
            request_descr,
            request_status,
            request_date,
            request_time_left,
            category:category_id (category_name),
            user:user_id (user_fullname, user_email)
        `)
        .eq('request_status', 'in_process')
        .eq('attached_to', user);

    if (inProcessRequestsError) {
        return NextResponse.json({ error: inProcessRequestsError.message }, { status: 500 });
    }

    // Объединяем результаты запросов
    const allRequests = [...newRequests, ...inProcessRequests];

    return NextResponse.json({ requests: allRequests }, { status: 200 });
}
