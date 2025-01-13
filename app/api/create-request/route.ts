import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST(req: Request) {
    try {
        console.log('Получение клиента Supabase...');
        const supabase = await createClient();

        console.log('Получение данных из запроса...');
        const { formData, files } = await req.json();

        console.log('Обработка времени выполнения...');
        const requestTimeLeft = new Date(formData.request_time_left);
        if (isNaN(requestTimeLeft.getTime())) {
            console.error('Ошибка: Неверный формат времени:', formData.request_time_left);
            throw new Error('Неверный формат времени.');
        }


        console.log('Создание записи в таблице request...');
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

        if (requestError) {
            console.error('Ошибка при создании записи в request:', requestError);
            throw requestError;
        }

        const requestId = requestData.request_id;
        console.log('Запись успешно создана с ID:', requestId);

        console.log('Загрузка файлов...');
        for (const file of files) {
            console.log(`Загрузка файла: ${file.name}`);
            const { data: fileData, error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(`${requestId}/${file.name}`, Buffer.from(file.content, 'base64'));

            if (uploadError) {
                console.error(`Ошибка при загрузке файла ${file.name}:`, uploadError);
                throw uploadError;
            }

            console.log(`Файл ${file.name} успешно загружен, путь:`, fileData?.path);

            console.log('Создание записи в таблице attachment...');
            const { error: attachmentError } = await supabase
                .from('attachment')
                .insert({
                    request_id: requestId,
                    attachment_path: fileData?.path,
                    attachment_name: file.name,
                });

            if (attachmentError) {
                console.error('Ошибка при создании записи в attachment:', attachmentError);
                throw attachmentError;
            }

            console.log(`Запись для файла ${file.name} успешно создана.`);
        }

        console.log('Процесс завершен успешно.');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Общая ошибка:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
