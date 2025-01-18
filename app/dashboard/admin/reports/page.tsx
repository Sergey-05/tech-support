'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '', userId: '' });

  useEffect(() => {
    async function fetchReports() {
      const params = new URLSearchParams(filters).toString();
      console.log('Fetching reports with filters:', JSON.stringify(filters, null, 2));
      const response = await fetch(`/api/admin/get_stat?${params}`);
      const data = await response.json();
      if (!data.error) {
        console.log('Reports fetched:', JSON.stringify(data.data, null, 2));
        setReports(data.data);
      } else {
        console.error('Error fetching reports:', data.error);
      }
    }
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Filter change:', name, value);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const completedRequests = reports.filter((r) => r.request_status === 'completed');
  const categories = Array.from(new Set(reports.map((r) => r.category.category_name)));

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Completed Requests by Category',
        data: categories.map((category) => completedRequests.filter((r) => r.category.category_name === category).length),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Technical Support Reports</h1>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <select
          name="categoryId"
          value={filters.categoryId}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Bar data={chartData} />
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Request Head</th>
              <th className="border border-gray-300 p-2">Category</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Completion Time</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.request_id}>
                <td className="border border-gray-300 p-2">{report.request_head}</td>
                <td className="border border-gray-300 p-2">{report.category.category_name}</td>
                <td className="border border-gray-300 p-2">{report.request_status}</td>
                <td className="border border-gray-300 p-2">
                  {format(new Date(report.request_finish_time), 'dd/MM/yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}