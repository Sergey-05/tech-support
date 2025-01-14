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

    // Функция для преобразования даты в UTC (с вычитанием 3 часов для учёта часового пояса MSK)
    const convertToUTC = (dateStr: string) => {
        const date = new Date(dateStr);
        // Убираем 3 часа для приведения к UTC
        date.setHours(date.getHours() - 3);
        return date.toISOString(); // Возвращаем в ISO формате (UTC)
    };

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
        const startDateUTC = convertToUTC(startDate);
        query = query.gte('request_date', startDateUTC); // Сравниваем с датой в UTC
    }

    if (endDate) {
        const endDateUTC = convertToUTC(endDate);
        query = query.lte('request_date', endDateUTC); // Сравниваем с датой в UTC
    }

    // Выполнение запроса
    const { data: requests, error } = await query.order('request_date', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Преобразование всех полученных дат в запросе обратно в MSK (UTC+3)
    const requestsWithAdjustedDates = requests.map((request) => {
        const mskDate = new Date(request.request_date);
        mskDate.setHours(mskDate.getHours() + 3); // Приводим к MSK
        return { ...request, request_date: mskDate.toLocaleString() }; // Отображаем дату в локальном времени
    });

    return NextResponse.json({ requests: requestsWithAdjustedDates }, { status: 200 });
}
