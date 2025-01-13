import { createClient } from '../../utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: any, res: any) {
    const supabase = await createClient();

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
    
    const { data: categories, error: categoryError } = await supabase
        .from('category')
        .select('category_id, category_name');

    if (!categories || categories.length === 0) {
        return NextResponse.json({ userDetails, categories: [] }, { status: 200 });
    }
        
    if (categoryError) {
        return NextResponse.json({ error: 'Ошибка при загрузке категорий' }, { status: 500 });
    }

    return NextResponse.json({ userDetails, categories }, { status: 200 });
}
