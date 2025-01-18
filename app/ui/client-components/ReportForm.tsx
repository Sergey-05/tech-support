// components/ReportForm.tsx
import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/server';

interface ReportData {
  request_id: number;
  request_date: string;
  request_status: string;
  // Добавьте другие поля по необходимости
}

const ReportForm: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [reports, setReports] = useState<ReportData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    const supabase = await createClient();
    e.preventDefault();
    const { data, error } = await supabase
      .from('request')
      .select('request_id, request_date, request_status')
      .gte('request_date', startDate)
      .lte('request_date', endDate)
      .eq('request_status', status);

    if (error) {
      console.error(error);
    } else {
      setReports(data);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block">Начальная дата:</label>
          <input 
            type="date" 
            id="startDate" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="border p-2"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block">Конечная дата:</label>
          <input 
            type="date" 
            id="endDate" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="border p-2"
          />
        </div>
        <div>
          <label htmlFor="status" className="block">Статус заявки:</label>
          <select 
            id="status" 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="border p-2"
          >
            <option value="">Все</option>
            <option value="open">Открыта</option>
            <option value="closed">Закрыта</option>
            {/* Добавьте другие статусы по необходимости */}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">Создать отчет</button>
      </form>

      <div className="mt-4">
        <h2 className="text-xl">Результаты отчета:</h2>
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID заявки</th>
              <th className="border p-2">Дата заявки</th>
              <th className="border p-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.request_id}>
                <td className="border p-2">{report.request_id}</td>
                <td className="border p-2">{report.request_date}</td>
                <td className="border p-2">{report.request_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportForm;
