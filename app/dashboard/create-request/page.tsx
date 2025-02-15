// 'use client';


// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CustomProvider, DatePicker, TimePicker } from 'rsuite';
// import 'rsuite/DatePicker/styles/index.css';
// import * as locales from 'rsuite/locales';
// import { useDropzone } from 'react-dropzone';
// import { getUserId } from '@/app/utils/supabase/user';

// export type Category = {
//   category_id: number;
//   category_name: string;
// };

// interface LocaleData {
//   key: string;
//   value: any;
// }

// const localeData: LocaleData[] = Object.keys(locales).map((key) => ({
//   key: key.replace(/([a-z]{2})([A-Z]{2})/, '$1-$2'),
//   value: locales[key as keyof typeof locales],
// }));

// export default function CreatePage() {
//   const [formData, setFormData] = useState({
//     requestHead: '',
//     requestDescr: '',
//     categoryId: '',
//     userId: '',
//   });
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [currentUserId, setCurrentUserId] = useState<string>('');
//   const [files, setFiles] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [localeKey, setLocaleKey] = useState<string>('ru-RU');
//   const locale = localeData.find((item) => item.key === localeKey);
//   const [date, setDate] = useState<Date | null>(null);
//   const [time, setTime] = useState<Date | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {

//         const userId = await getUserId();
//         setCurrentUserId(userId);

//         const response = await fetch('/api/get-user-and-categories');
//         if (!response.ok) throw new Error('Ошибка при загрузке данных');
//         const result = await response.json();
//         setFormData((prev) => ({ ...prev, userId: result.userDetails.user_id }));
//         setCategories(result.categories);
//       } catch (err) {
//         console.error('Ошибка:', err);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
  
//     if (!formData.requestHead || !formData.categoryId || !date || !time) {
//       setError('Пожалуйста, заполните все обязательные поля.');
//       setLoading(false);
//       return;
//     }
  
//     const requestTimeLeft = new Date(date);
//     requestTimeLeft.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
  
//     if (isNaN(requestTimeLeft.getTime()) || requestTimeLeft <= new Date()) {
//       setError('Неверный или устаревший формат времени.');
//       setLoading(false);
//       return;
//     }
  
//     try {
//       console.log("Файлы перед отправкой:", files);
  
//       // Создаем новый FormData объект для отправки файлов в их исходном виде
//       const form = new FormData();
//       files.forEach((file) => {
//         form.append('files', file); // Добавляем каждый файл
//       });
//       form.append('user_id', formData.userId);
//       form.append('request_head', formData.requestHead);
//       form.append('request_descr', formData.requestDescr);
//       form.append('category_id', formData.categoryId);
//       form.append('request_time_left', requestTimeLeft.toISOString());

//       // Отправка данных на сервер
//       const response = await fetch('/api/create-request', {
//         method: 'POST',
//         body: form,
//       });
  
//       const result = await response.json();
//       if (!result.success) throw new Error(result.error);
  
//       router.push('/dashboard');
//     } catch (err) {
//       console.error(err);
//       setError('Ошибка при создании заявки.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setError('');
  
//   //   if (!formData.requestHead || !formData.categoryId || !date || !time) {
//   //     setError('Пожалуйста, заполните все обязательные поля.');
//   //     setLoading(false);
//   //     return;
//   //   }
  
//   //   const requestTimeLeft = new Date(date);
//   //   requestTimeLeft.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
  
//   //   if (isNaN(requestTimeLeft.getTime()) || requestTimeLeft <= new Date()) {
//   //     setError('Неверный или устаревший формат времени.');
//   //     setLoading(false);
//   //     return;
//   //   }
  
//   //   try {
//   //     console.log("Файлы перед отправкой:", files);
  
//   //     // Проверка на поддерживаемость arrayBuffer
//   //     const preparedFiles = await Promise.all(
//   //       files.map(async (file) => {
//   //         if (file.arrayBuffer) {
//   //           try {
//   //             const content = await file.arrayBuffer();
//   //             // Преобразование ArrayBuffer в строку Base64
//   //             const base64Content = Buffer.from(content).toString('base64');
//   //             return {
//   //               name: file.name,
//   //               type: file.type,
//   //               content: base64Content,
//   //             };
//   //           } catch (err) {
//   //             console.error(`Ошибка при обработке файла ${file.name}:`, err);
//   //             throw new Error(`Ошибка при обработке файла ${file.name}`);
//   //           }
//   //         } else {
//   //           console.error(`Метод arrayBuffer не поддерживается для файла ${file.name}`);
//   //           throw new Error(`Метод arrayBuffer не поддерживается для файла ${file.name}`);
//   //         }
//   //       })
//   //     );
      
//   //     console.log("Подготовленные файлы:", preparedFiles);
  
//   //     const response = await fetch('/api/create-request', {
//   //       method: 'POST',
//   //       headers: { 'Content-Type': 'application/json' },
//   //       body: JSON.stringify({
//   //         formData: { ...formData, request_time_left: requestTimeLeft.toISOString() },
//   //         files: preparedFiles,
//   //       }),
//   //     });
  
//   //     const result = await response.json();
//   //     if (!result.success) throw new Error(result.error);
  
//   //     router.push('/dashboard');
//   //   } catch (err) {
//   //     console.error(err);
//   //     setError('Ошибка при создании заявки.');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
  
  


//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop: (acceptedFiles) => {
//       setFiles((prev) => {
//         console.log('prev:', prev); // Проверим старые файлы
//         console.log('acceptedFiles:', acceptedFiles); // Проверим новые файлы
//         return [...prev, ...acceptedFiles]; // Добавляем новые файлы к старым
//       });
//     },
//     multiple: true,
//   });
  

  

//   return (
//     <section className="p-4 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Создать заявку</h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium">Заголовок заявки</label>
//           <input
//             type="text"
//             name="requestHead"
//             value={formData.requestHead}
//             onChange={handleInputChange}
//             required
//             className="w-full p-2 border rounded focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Описание заявки</label>
//           <textarea
//             name="requestDescr"
//             value={formData.requestDescr}
//             onChange={handleInputChange}
//             required
//             className="w-full p-2 border rounded focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Категория</label>
//           <select
//             name="categoryId"
//             value={formData.categoryId}
//             onChange={handleInputChange}
//             required
//             className="w-full p-2 border rounded focus:ring-indigo-500"
//           >
//             <option value="">Выберите категорию</option>
//             {categories.map((category) => (
//               <option key={category.category_id} value={category.category_id}>
//                 {category.category_name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <CustomProvider locale={locale?.value}>
//           <div className="flex space-x-4">
//             <DatePicker
//               oneTap
//               placeholder="Дата выполнения"
//               value={date}
//               onChange={setDate}
//               style={{ flex: 1 }}
//             />
//             <TimePicker
//               placeholder="Время выполнения"
//               value={time}
//               onChange={setTime}
//               style={{ flex: 1 }}
//             />
//           </div>
//         </CustomProvider>
//         <div>
//           <label className="block text-sm font-medium">Вложения</label>
//           <div {...getRootProps()} className="p-4 border-dashed border-2 rounded-md cursor-pointer">
//             <input {...getInputProps()} />
//             <p className="text-center text-gray-500">Перетащите файлы сюда или нажмите для выбора</p>
//           </div>
//           <div className="mt-2">
//             {files.map((file, index) => (
//               <div key={index} className="flex items-center space-x-2 mt-2">
//                 <span className="text-sm">{file.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//         {error && <p className="text-red-500">{error}</p>}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           {loading ? 'Создание...' : 'Создать заявку'}
//         </button>
//       </form>
//     </section>
//   );
// }



'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomProvider, DatePicker, TimePicker } from 'rsuite';
import 'rsuite/DatePicker/styles/index.css';
import * as locales from 'rsuite/locales';
import { useDropzone } from 'react-dropzone';
import { getUserId } from '@/app/utils/supabase/user';

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
  value: locales[key as keyof typeof locales],
}));

export default function CreatePage() {
  const [formData, setFormData] = useState({
    requestHead: '',
    requestDescr: '',
    categoryId: '',
    userId: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localeKey, setLocaleKey] = useState<string>('ru-RU');
  const locale = localeData.find((item) => item.key === localeKey);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);

        const response = await fetch('/api/get-user-and-categories');
        if (!response.ok) throw new Error('Ошибка при загрузке данных');
        const result = await response.json();
        setFormData((prev) => ({ ...prev, userId: result.userDetails.user_id }));
        setCategories(result.categories);
      } catch (err) {
        console.error('Ошибка:', err);
        setError('Не удалось загрузить данные.');
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

    const requestTimeLeft = new Date(date);
    requestTimeLeft.setHours(time.getHours(), time.getMinutes(), time.getSeconds());

    if (isNaN(requestTimeLeft.getTime()) || requestTimeLeft <= new Date()) {
      setError('Неверный или устаревший формат времени.');
      setLoading(false);
      return;
    }

    try {
      // Создаем новый FormData объект для отправки файлов в их исходном виде
      const form = new FormData();
      files.forEach((file) => {
        form.append('files', file); // Добавляем каждый файл
      });
      form.append('userId', formData.userId);
      form.append('requestHead', formData.requestHead);
      form.append('requestDescr', formData.requestDescr);
      form.append('categoryId', formData.categoryId);
      form.append('requestTimeLeft', requestTimeLeft.toISOString());

      // Отправка данных на сервер
      const response = await fetch('/api/create-request', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Перенаправление после успешного создания заявки
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Ошибка при создании заявки.');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => {
        console.log('prev:', prev); // Проверим старые файлы
        console.log('acceptedFiles:', acceptedFiles); // Проверим новые файлы
        return [...prev, ...acceptedFiles]; // Добавляем новые файлы к старым
      });
    },
    multiple: true,
  });

  return (
    <section className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Создать заявку</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Заголовок заявки</label>
          <input
            type="text"
            name="requestHead"
            value={formData.requestHead}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Описание заявки</label>
          <textarea
            name="requestDescr"
            value={formData.requestDescr}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Категория</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded focus:ring-indigo-500"
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
          <div className="flex space-x-4">
            <DatePicker
              oneTap
              placeholder="Дата выполнения"
              value={date}
              onChange={setDate}
              style={{ flex: 1 }}
            />
            <TimePicker
              placeholder="Время выполнения"
              value={time}
              onChange={setTime}
              style={{ flex: 1 }}
            />
          </div>
        </CustomProvider>
        <div>
          <label className="block text-sm font-medium">Вложения</label>
          <div {...getRootProps()} className="p-4 border-dashed border-2 rounded-md cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-center text-gray-500">Перетащите файлы сюда или нажмите для выбора</p>
          </div>
          <div className="mt-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Создание...' : 'Создать заявку'}
        </button>
      </form>
    </section>
  );
}
