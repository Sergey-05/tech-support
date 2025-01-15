


import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!id) {
      console.error('Missing request_id');
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const user_id = formData.get('user_id') as string;

    if (!files.length) {
      console.error('No files received');
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    const supabase = await createClient();
    const storage = supabase.storage.from('attachments');
    const uploadedFiles = [];

    for (const file of files) {
      if (!file) continue;

      const uniqueId = uuidv4();
      const fileExtension = path.extname(file.name);
      const fileName = `${uniqueId}${fileExtension}`;
      const filePath = `${id}/${fileName}`;

      // Загрузка исходного файла в Supabase Storage
      const { data: uploadData, error: uploadError } = await storage.upload(filePath, file);

      if (uploadError) {
        console.error('File upload error:', uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const attachmentData = {
        request_id: id,
        attachment_uploaded_by: user_id,
        attachment_uploaded_at: new Date().toISOString(),
        attachment_path: filePath,
        attachment_name: file.name,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('attachment')
        .insert([attachmentData])
        .select('attachment_id, attachment_name, attachment_path, attachment_uploaded_by, attachment_uploaded_at');

      if (insertError) {
        console.error('Database insert error:', insertError.message);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      uploadedFiles.push(insertedData[0]);
    }

    return NextResponse.json({ attachments: uploadedFiles }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
