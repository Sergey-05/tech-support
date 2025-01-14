import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';


export async function GET() {
  const supabase = await createClient();
  const { data: categories, error: categoryError } = await supabase
        .from('category')
        .select('category_id, category_name');

    if (!categories || categories.length === 0) {
        return NextResponse.json({ categories: [] }, { status: 200 });
    }
        
    if (categoryError) {
        return NextResponse.json({ error: 'Ошибка при загрузке категорий' }, { status: 500 });
    }

    return NextResponse.json({ categories }, { status: 200 });
}
