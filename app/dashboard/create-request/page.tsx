'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'rsuite/DatePicker/styles/index.css';
import {
  CustomProvider,
  SelectPicker,
  DatePicker,
  TimePicker,
  Calendar,
  Stack,
  Divider,
} from 'rsuite';
import * as locales from 'rsuite/locales';

export type Category = {
    category_id: number;
    category_name: string;
};

interface LocaleData {
    key: string;
    value: any;
  }

  const localeData: LocaleData[] = Object.keys(locales).map((key) => ({
    key: key.replace(/([a-z]{2})([A-Z]{2})/, '$1-$2'),
    value: locales[key as keyof typeof locales], // Явное указание типа
  }));

export default function CreatePage() {
    const [formData, setFormData] = useState({
        requestHead: '',
        requestDescr: '',
        categoryId: '',
        userId: '',
        request_date: new Date(), // Начальная дата
        request_time_left: new Date(), // Время по умолчанию
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [localeKey, setLocaleKey] = useState<string>('ru-RU');
  const locale = localeData.find((item) => item.key === localeKey);
  const [date, setDate] = useState<Date | null>(null); // Состояние для даты
  const [time, setTime] = useState<Date | null>(null); // Состояние для времени

    


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/get-user-and-categories');

                if (!response.ok) {
                    const result = await response.text(); // Получение тела ответа для отладки
                    console.error('Ошибка от сервера:', result);
                    throw new Error('Ошибка при загрузке данных');
                }

                const result = await response.json(); // Парсинг JSON
                console.log('Данные:', result);

                setFormData((prev) => ({ ...prev, userId: result.userDetails.user_id }));
                setCategories(result.categories);
            } catch (err) {
                console.error('Ошибка:', err);
            }
        };

        fetchData();
    }, [router]);

    
    

    const allowedFileTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/mpeg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            const invalidFiles = selectedFiles.filter(file => !allowedFileTypes.includes(file.type));
            if (invalidFiles.length > 0) {
                setError('Некоторые файлы имеют неподдерживаемый формат.');
                return;
            }

            setFiles(selectedFiles);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        if (!formData.requestHead || !formData.categoryId || !date || !time) {
            setError('Пожалуйста, заполните все обязательные поля.');
            setLoading(false);
            return;
        }
    
        // Комбинируем дату и время
    const requestTimeLeft = new Date(date);
    requestTimeLeft.setHours(time.getHours(), time.getMinutes(), time.getSeconds());

    // Проверка корректности времени
    if (isNaN(requestTimeLeft.getTime())) {
      setError('Неверный формат времени.');
      setLoading(false);
      return;
    }

    // Проверка на будущее время
    if (requestTimeLeft <= new Date()) {
      console.error('Ошибка: Желаемое время выполнения должно быть в будущем:', requestTimeLeft);
      setError('Желаемое время выполнения должно быть в будущем.');
      setLoading(false);
      return;
    }
    
        try {
            const preparedFiles = await Promise.all(
                files.map(async (file) => ({
                    name: file.name,
                    type: file.type,
                    content: btoa(String.fromCharCode(...new Uint8Array(await file.arrayBuffer()))), // Преобразование файла в строку
                }))
            );
    
            const response = await fetch('/api/create-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formData: {
                        ...formData,
                        request_time_left: requestTimeLeft.toISOString(), // ISO-строка для передачи времени
                    },
                    files: preparedFiles,
                }),
            });
    
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
    
            alert('Заявка успешно создана!');
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Ошибка при создании заявки.');
        } finally {
            setLoading(false);
        }
    };
    
    
      
    
      
    return (
        <section className="p-8">
            <h2 className="text-2xl font-bold mb-4">Создать заявку</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Заголовок заявки */}
                <div>
                    <label className="block text-sm font-medium">Заголовок заявки</label>
                    <input
                        type="text"
                        name="requestHead"
                        value={formData.requestHead}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Описание заявки */}
                <div>
                    <label className="block text-sm font-medium">Описание заявки</label>
                    <textarea
                        name="requestDescr"
                        value={formData.requestDescr}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Категория */}
                <div>
                    <label className="block text-sm font-medium">Категория</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                            </option>
                        ))}
                    </select>
                </div>


    <CustomProvider locale={locale?.value}>
      <Stack spacing={40}>
        <DatePicker 
            oneTap
            style={{ width: 300 }}
            placeholder='Дата выполнения'
            value={date}
            onChange={setDate} />
        <TimePicker
            style={{ width: 300 }}
            placeholder='Время выполнения'
            value={time}
            onChange={setTime} />
      </Stack>
    </CustomProvider>

                  



                
                

                {/* Вложения */}
                <div>
                    <label className="block text-sm font-medium">Вложения</label>
                    <input
                        type="file"
                        multiple
                        accept={allowedFileTypes.join(',')}
                        onChange={handleFileChange}
                        className="block w-full py-2 px-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}

                {/* Кнопка отправки формы */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    {loading ? 'Создание...' : 'Создать заявку'}
                </button>
            </form>
        </section>
    );
}
