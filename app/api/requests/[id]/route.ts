// import { createClient } from '@/app/utils/supabase/server';
// import { NextResponse } from 'next/server';

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // Ожидаем разрешения params
//     const { id } = await params;

//     const supabase = await createClient();

//     const { data: requestData, error: requestError } = await supabase
//       .from('request')
//       .select(
//         `
//         *,
//         attachment (
//           attachment_id,
//           attachment_name,
//           attachment_path
//         ),
//         comment (
//           comment_id,
//           comment_text,
//           comment_time
//         )
//       `
//       )
//       .eq('request_id', id)
//       .single();

//     if (requestError) {
//       return NextResponse.json({ error: requestError.message }, { status: 500 });
//     }

//     if (!requestData) {
//       return NextResponse.json({ error: 'Request not found' }, { status: 404 });
//     }

//     return NextResponse.json({ request: requestData }, { status: 200 });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


// app/api/requests/[id]/route.ts
// app/api/requests/[id]/route.ts
import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  

    const { id } = await params;

    if (!id) {
      console.error('No ID provided in the request parameters.');
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    console.log(`Fetching request data for ID: ${id}`);
    const { data: requestData, error: requestError } = await supabase
      .from('request')
      .select(`
        *, 
        attachment ( 
          attachment_id, 
          attachment_name, 
          attachment_path, 
          attachment_uploaded_at,
          attachment_uploaded_by ( 
            user_id, 
            user_fullname 
          ) 
        ), 
        comment ( 
          comment_id, 
          comment_text, 
          comment_time, 
          comment_sent_by ( 
            user_id, 
            user_fullname 
          ) 
        ) 
      `)
      .eq('request_id', id)
      .single();

    if (requestError) {
      console.error('Error fetching request data:', requestError.message);
      return NextResponse.json({ error: requestError.message }, { status: 500 });
    }

    if (!requestData) {
      console.warn(`Request with ID ${id} not found.`);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    console.log(`Successfully fetched request with ID ${id}.`);
    return NextResponse.json({ request: requestData }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in GET request:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
