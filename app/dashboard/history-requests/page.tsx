'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]); // Массив для категорий
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    // Получение категорий из API
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch('/api/categories'); // Запрос к вашему API
            const data = await response.json();
            
            if (response.ok) {
                setCategories(data.categories || []); // Присваиваем полученные категории
            } else {
                console.error(data.error);
            }
        };

        fetchCategories();
    }, []);

    // Получение заявок с фильтрами
    useEffect(() => {
        const fetchRequests = async () => {
            const params = new URLSearchParams();

            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter.toString());
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/requests?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setRequests(data.requests || []); // Присваиваем пустой массив, если данные пусты
            } else {
                console.error(data.error);
                setRequests([]); // В случае ошибки тоже присваиваем пустой массив
            }
        };

        fetchRequests();
    }, [statusFilter, categoryFilter, startDate, endDate]);

    // Функция для получения цвета статуса
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'text-green-500'; // Зеленый для новой заявки
            case 'in_process':
                return 'text-yellow-500'; // Желтый для заявки в процессе
            case 'completed':
                return 'text-blue-500'; // Синий для выполненной заявки
            case 'canceled':
                return 'text-red-500'; // Красный для отклоненной заявки
            default:
                return 'text-gray-500'; // Сероватый цвет по умолчанию
        }
    };

    return (
        <section className="p-4 max-w-screen-xl">
            <h2 className="text-3xl font-bold mb-6">История заявок</h2>

            <div className="mb-6 flex flex-wrap gap-4">
                <select
                    className="border p-2 rounded-lg w-48"
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                >
                    <option value="">Все статусы</option>
                    <option value="new">Новая</option>
                    <option value="in_process">В процессе</option>
                    <option value="completed">Завершена</option>
                    <option value="canceled">Отменена</option>
                </select>

                {/* Динамическое отображение категорий */}
                <select
                    className="border p-2 rounded-lg w-48"
                    value={categoryFilter || ''}
                    onChange={(e) => setCategoryFilter(Number(e.target.value) || null)}
                >
                    <option value="">Все категории</option>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                            </option>
                        ))
                    ) : (
                        <option>Загружается...</option> // Показать, пока данные загружаются
                    )}
                </select>

                <input
                    
                    type="date"
                    className="border p-2 rounded-lg w-48"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value || null)}
                />

                <input
                    type="date"
                    className="border p-2 rounded-lg w-48"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value || null)}
                />
            </div>

            <ul className="space-y-4">
                {/* Проверка, чтобы не вызывать map, если requests не является массивом */}
                {Array.isArray(requests) && requests.length > 0 ? (
                    requests.map((request) => (
                        <li key={request.request_id} className="border p-4 rounded-lg shadow-md bg-white hover:bg-gray-100 transition-all duration-200">
                            <Link
                            href={`/dashboard/history-requests/${request.request_id}`}>
                                <div>
                            <h3 className="font-semibold text-lg">{request.request_head}</h3>
                            <p className="text-sm text-gray-600">{request.request_descr}</p>

                            {/* Отображение категории заявки */}
                            <p className="text-sm text-gray-500 mt-2">
                                <strong>Категория:</strong> {categories.find((category) => category.category_id === request.category_id)?.category_name || 'Не указана'}
                            </p>

                            {/* Статус заявки с цветом */}
                            <p className={`font-bold ${getStatusColor(request.request_status)} mt-2`}>
                                {request.request_status === 'new' && 'Новая'}
                                {request.request_status === 'in_process' && 'В процессе'}
                                {request.request_status === 'completed' && 'Завершена'}
                                {request.request_status === 'canceled' && 'Отклонена'}
                            </p>

                            <p className="text-sm text-gray-500 mt-2">
                                <strong>Дата:</strong> 
                                {new Date(request.request_date).getTime() ? 
        new Date(request.request_date).toLocaleString() :
        'Неверная дата'
    }
                            </p>

                            </div>
                            </Link>
                            
                        </li>
                    ))
                ) : (
                    <li className="text-center text-gray-500">Заявки не найдены</li>
                )}
            </ul>
        </section>
    );
}
