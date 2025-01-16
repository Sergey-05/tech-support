'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('/api/admin/');
                const data = await response.json();

                if (response.ok) {
                    setRequests(data.requests || []);
                } else {
                    console.error(data.error || 'Ошибка загрузки заявок');
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
            }
        };

        fetchRequests();
    }, []);

    const handleRequestAction = async (
        requestId: string,
        action: 'accept' | 'reject' | 'complete'
    ) => {
        try {
            const body = { action };
            const response = await fetch(`/api/requests/${requestId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const updatedRequest = await response.json();
                setRequests((prevRequests) =>
                    prevRequests.map((req) =>
                        req.request_id === requestId ? updatedRequest : req
                    )
                );
            } else {
                console.error('Ошибка обработки действия:', await response.text());
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
    };

    return (
        <section className="p-4 max-w-screen-xl">
            <h2 className="text-3xl font-bold mb-6">Заявки</h2>

            <ul className="space-y-4">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <li
                            key={request.request_id}
                            className="border p-4 rounded-lg shadow-md bg-white hover:bg-gray-100 transition-all duration-200"
                        >
                            <div>
                                <h3 className="font-semibold text-lg">{request.request_head}</h3>
                                <p className="text-sm text-gray-600">{request.request_descr}</p>

                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Категория:</strong> {request.category?.category_name || 'Не указана'}
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Создатель:</strong> {request.user?.user_fullname} (
                                    {request.user?.user_email})
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Дата:</strong>{' '}
                                    {new Date(request.request_date).toLocaleString() || 'Не указана'}
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    <strong>Оставшееся время:</strong> {request.request_time_left || 'Не указано'}
                                </p>

                                <div className="mt-4 flex space-x-2">
                                    {request.request_status === 'new' && (
                                        <button
                                            onClick={() => handleRequestAction(request.request_id, 'accept')}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Принять
                                        </button>
                                    )}

                                    {request.request_status === 'in_process' && (
                                        <>
                                            <button
                                                onClick={() => handleRequestAction(request.request_id, 'reject')}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Отклонить
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(request.request_id, 'complete')}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Завершить
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="text-center text-gray-500">Заявки не найдены</li>
                )}
            </ul>
        </section>
    );
}
