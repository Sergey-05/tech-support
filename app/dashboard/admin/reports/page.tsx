'use client';
import React from 'react';
import ReportForm from '@/app/ui/client-components/ReportForm';

export default function HomePage () {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Отчеты по выполнению заявок</h1>
      <ReportForm />
    </div>
  );
};


