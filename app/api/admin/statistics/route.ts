import { createClient } from "@/app/utils/supabase/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { procedureName, args } = await req.json();

    if (!procedureName) {
        return new Response(JSON.stringify({ error: 'Procedure name is required' }), { status: 400 });
    }

    const { data, error } = await supabase.rpc(procedureName, args);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
}
