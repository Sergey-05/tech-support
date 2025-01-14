import { createClient } from '../../utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const supabase = await createClient();

    // Получение текущего пользователя
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userDetails, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('user_uuid', user.id)
        .single();

    if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    // Получение параметров фильтрации из запроса
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');



    // Создание запроса к базе данных
    let query = supabase
        .from('request')
        .select('request_id, request_head, request_descr, request_status, category_id, request_date')
        .eq('user_id', userDetails.user_id);

    if (status) {
        query = query.eq('request_status', status);
    }

    if (category) {
        query = query.eq('category_id', Number(category));
    }

    if (startDate) {
        query = query.gte('request_date', startDate);
    }

    if (endDate) {
        const endOfDay = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString();
        query = query.lte('request_date', endOfDay);
    }

    // Выполнение запроса
    const { data: requests, error } = await query.order('request_date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    

    return NextResponse.json({ requests }, { status: 200 });
}
