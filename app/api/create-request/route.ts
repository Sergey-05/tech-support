import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';
import { v4 as uuidv4 } from 'uuid'; // Для генерации уникальных ID



const encodeFileName = (fileName: string) => {
    return fileName
        .normalize("NFD") // Преобразование в NFC (нормализация)
        .replace(/[\u0300-\u036f]/g, '') // Удаление диакритических знаков
        .replace(/[^a-zA-Z0-9-_\.]/g, '_') // Заменить все нелатинские символы и спец. символы на подчеркивания
        .replace(/\s+/g, '_') // Заменить пробелы на подчеркивания
        .toLowerCase(); // Привести к нижнему регистру
};


export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { formData, files } = await req.json();

        const requestTimeLeft = new Date(formData.request_time_left);
        if (isNaN(requestTimeLeft.getTime())) {
            throw new Error('Неверный формат времени.');
        }

        const { data: requestData, error: requestError } = await supabase
            .from('request')
            .insert({
                request_head: formData.requestHead,
                request_descr: formData.requestDescr,
                category_id: parseInt(formData.categoryId),
                user_id: parseInt(formData.userId),
                request_time_left: requestTimeLeft.toISOString(),
                request_date: new Date().toISOString(),
                request_status: 'new',
            })
            .select('request_id')
            .single();

        if (requestError) throw requestError;

        const requestId = requestData.request_id;

        const uploadResults = await Promise.all(
            files.map(async (file: any) => {
                try {
                    // Применяем функцию для безопасных имен файлов
                    const safeFileName = encodeFileName(file.name);
        
                    // Создаем уникальный путь для файла
                    const uniqueFileName = `${requestId}/${safeFileName}`;
        
                    // Загружаем файл в хранилище Supabase
                    const { data: fileData, error: uploadError } = await supabase.storage
  .from('attachments')
  .upload(uniqueFileName, Buffer.from(file.content, 'base64')); // Указываем Base64

        
                    if (uploadError) throw uploadError;
        
                    // Сохраняем путь файла в базе данных
                    const { error: attachmentError } = await supabase
                        .from('attachment')
                        .insert({
                            request_id: requestId,
                            attachment_path: fileData?.path,  // Сохраняем безопасный путь
                            attachment_name: file.name,    // Сохраняем безопасное имя файла
                        });
        
                    if (attachmentError) throw attachmentError;
        
                    return { success: true, file: file.name };
                } catch (error: any) {
                    return { success: false, file: file.name, error: error.message };
                }
            })
        );
        
        const failedUploads = uploadResults.filter((result) => !result.success);
        if (failedUploads.length > 0) {
            console.error('Ошибки загрузки файлов:', failedUploads);
        }
        
        return NextResponse.json({ success: true, failedUploads });
        
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
