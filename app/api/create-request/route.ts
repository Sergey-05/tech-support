// import { NextResponse } from 'next/server';
// import { createClient } from '../../utils/supabase/server';
// import { v4 as uuidv4 } from 'uuid'; // Для генерации уникальных ID



// const encodeFileName = (fileName: string) => {
//     return fileName
//         .normalize("NFD") // Преобразование в NFC (нормализация)
//         .replace(/[\u0300-\u036f]/g, '') // Удаление диакритических знаков
//         .replace(/[^a-zA-Z0-9-_\.]/g, '_') // Заменить все нелатинские символы и спец. символы на подчеркивания
//         .replace(/\s+/g, '_') // Заменить пробелы на подчеркивания
//         .toLowerCase(); // Привести к нижнему регистру
// };


// export async function POST(req: Request) {
//     try {
//         const supabase = await createClient();

//         const { formData, files } = await req.json();

//         const requestTimeLeft = new Date(formData.request_time_left);
//         if (isNaN(requestTimeLeft.getTime())) {
//             throw new Error('Неверный формат времени.');
//         }

//         const { data: requestData, error: requestError } = await supabase
//             .from('request')
//             .insert({
//                 request_head: formData.requestHead,
//                 request_descr: formData.requestDescr,
//                 category_id: parseInt(formData.categoryId),
//                 user_id: parseInt(formData.userId),
//                 request_time_left: requestTimeLeft.toISOString(),
//                 request_date: new Date().toISOString(),
//                 request_status: 'new',
//             })
//             .select('request_id')
//             .single();

//         if (requestError) throw requestError;

//         const requestId = requestData.request_id;

//         const uploadResults = await Promise.all(
//             files.map(async (file: any) => {
//                 try {
//                     // Применяем функцию для безопасных имен файлов
//                     const safeFileName = encodeFileName(file.name);
        
//                     // Создаем уникальный путь для файла
//                     const uniqueFileName = `${requestId}/${safeFileName}`;
        
//                     // Загружаем файл в хранилище Supabase
//                     const { data: fileData, error: uploadError } = await supabase.storage
//   .from('attachments')
//   .upload(uniqueFileName, Buffer.from(file.content, 'base64')); // Указываем Base64

        
//                     if (uploadError) throw uploadError;
        
//                     // Сохраняем путь файла в базе данных
//                     const { error: attachmentError } = await supabase
//                         .from('attachment')
//                         .insert({
//                             request_id: requestId,
//                             attachment_path: fileData?.path,  // Сохраняем безопасный путь
//                             attachment_name: file.name,    // Сохраняем безопасное имя файла
//                         });
        
//                     if (attachmentError) throw attachmentError;
        
//                     return { success: true, file: file.name };
//                 } catch (error: any) {
//                     return { success: false, file: file.name, error: error.message };
//                 }
//             })
//         );
        
//         const failedUploads = uploadResults.filter((result) => !result.success);
//         if (failedUploads.length > 0) {
//             console.error('Ошибки загрузки файлов:', failedUploads);
//         }
        
//         return NextResponse.json({ success: true, failedUploads });
        
//     } catch (error: any) {
//         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//     }
// }

import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // Создаем клиента для Supabase
    const supabase = await createClient();
    
    // Получаем данные из формы
    const formData = await req.formData();
    
    if (!formData) {
      console.error('Не удалось получить formData.');
      return NextResponse.json({ error: 'Не удалось обработать форму.' }, { status: 400 });
    }

    const files = formData.getAll('files') as File[];
    const requestHead = formData.get('requestHead') as string;
    const requestDescr = formData.get('requestDescr') as string;
    const categoryId = formData.get('categoryId') as string;
    const userId = formData.get('userId') as string;
    const requestTimeLeft = formData.get('requestTimeLeft') as string;

    if (!requestHead || !requestDescr || !categoryId || !userId || !requestTimeLeft) {
      console.error('Отсутствуют обязательные параметры.');
      return NextResponse.json({ error: 'Отсутствуют обязательные параметры в запросе.' }, { status: 400 });
    }

    const requestTimeLeftDate = new Date(requestTimeLeft);
    if (isNaN(requestTimeLeftDate.getTime())) {
      console.error('Неверный формат времени:', requestTimeLeft);
      return NextResponse.json({ error: 'Неверный формат времени.' }, { status: 400 });
    }

    // Создаем запись о заявке
    const { data: requestData, error: requestError } = await supabase
      .from('request')
      .insert({
        request_head: requestHead,
        request_descr: requestDescr,
        category_id: parseInt(categoryId),
        user_id: parseInt(userId),
        request_time_left: requestTimeLeftDate.toISOString(),
        request_date: new Date().toISOString(),
        request_status: 'new',
      })
      .select('request_id')
      .single();

    if (requestError) {
      console.error('Ошибка создания заявки:', requestError.message);
      return NextResponse.json({ error: 'Ошибка при создании заявки.' }, { status: 500 });
    }

    const requestId = requestData.request_id;

    // Загрузка файлов в Supabase Storage
    const storage = supabase.storage.from('attachments');
    const uploadedFiles = [];

    if (!files || files.length === 0) {
      console.error('Не получены файлы.');
      return NextResponse.json({ error: 'Не получены файлы для загрузки.' }, { status: 400 });
    }

    for (const file of files) {
      if (!file) continue;

      const uniqueId = uuidv4();
      const fileExtension = path.extname(file.name);
      const fileName = `${uniqueId}${fileExtension}`;
      const filePath = `${requestId}/${fileName}`;

      // Загрузка файла в хранилище Supabase
      const { data: uploadData, error: uploadError } = await storage.upload(filePath, file);

      if (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError.message);
        return NextResponse.json({ error: `Ошибка загрузки файла: ${uploadError.message}` }, { status: 500 });
      }

      // Сохранение метаданных файла в базе данных
      const attachmentData = {
        request_id: requestId,
        attachment_path: filePath,
        attachment_name: file.name,
        attachment_uploaded_by: userId,
        attachment_uploaded_at: new Date().toISOString(),
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('attachment')
        .insert([attachmentData])
        .select('attachment_id, attachment_name, attachment_path, attachment_uploaded_by, attachment_uploaded_at');

      if (insertError) {
        console.error('Ошибка вставки в базу данных:', insertError.message);
        return NextResponse.json({ error: `Ошибка сохранения метаданных файла: ${insertError.message}` }, { status: 500 });
      }

      uploadedFiles.push(insertedData[0]);
    }

    // Ответ с успешной загрузкой файлов и созданной заявкой
    return NextResponse.json({ success: true, attachments: uploadedFiles, request_id: requestId }, { status: 201 });

  } catch (error: any) {
    console.error('Неожиданная ошибка:', error.message);
    return NextResponse.json({ success: false, error: `Неожиданная ошибка: ${error.message}` }, { status: 500 });
  }
}
