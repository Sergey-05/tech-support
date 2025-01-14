// app/requests/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface RequestDetails {
  request_id: number;
  request_head: string;
  request_descr: string;
  request_status: string;
  request_date: string;
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<RequestDetails | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/requests/${params.id}`);
        const data: RequestDetails = await res.json();
        setRequest(data);
      } catch (error) {
        console.error('Ошибка при загрузке заявки:', error);
      }
    };

    fetchRequest();
  }, [params.id]);

  if (!request) {
    return <div>Загрузка...</div>;
  }

  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold mb-4">{request.request_head}</h2>
      <p>{request.request_descr}</p>
      <p>Статус: {request.request_status}</p>
      <p>Дата: {new Date(request.request_date).toLocaleDateString()}</p>
    </section>
  );
}
