// app/api/average-completion-time/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';


export async function GET(request: Request) {

    const supabase = await createClient();

    try {
      const { data, error } = await supabase.rpc('calculate_average_completion_time');
      console.log(data, error);
      
          
    
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        return NextResponse.json({ average_completion_times: data }, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
}
