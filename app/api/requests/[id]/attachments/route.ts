import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 } from 'uuid';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!id) {
      console.error('Missing request_id');
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    const preparedFiles = await Promise.all(
      files.map(async (file) => {
        if (file) {
          const uniqueId = v4();
          const fileExtension = path.extname(file.name);
          const fileName = `${uniqueId}${fileExtension}`;
          const filePath = `${id}/${fileName}`;

          try {

            return {
              name: file.name,
              type: filePath,
              content: file,
            };
          } catch (err) {
            console.error(`Error processing file ${file.name}:`, err);
            throw new Error(`Error processing file ${file.name}`);
          }
        } else {
          console.error(`arrayBuffer not supported for file`);
          throw new Error(`arrayBuffer not supported for file`);
        }
      })
    );

    const supabase = await createClient();
    const storage = supabase.storage.from('attachments');
    const uploadedFiles = [];

    // Загрузка файлов в хранилище
    for (const file of preparedFiles) {
      const { data, error: uploadError } = await storage.upload(file.type, file.content);

      if (uploadError) {
        console.error('File upload error:', uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: attachmentData, error: attachmentError } = await supabase
        .from('attachment')
        .insert([{ request_id: id, attachment_name: file.name, attachment_path: file.type }])
        .select('*');

      if (attachmentError) {
        console.error('Database insert error:', attachmentError.message);
        return NextResponse.json({ error: attachmentError.message }, { status: 500 });
      }

      uploadedFiles.push(attachmentData[0]); // Добавляем файл в список
    }

    return NextResponse.json({ attachments: uploadedFiles }, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
