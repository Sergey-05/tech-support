'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TailSpin } from 'react-loader-spinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AverageCompletionTime {
  category_name: string;
  average_completion_time: string; // В виде интервала
}

interface ParsedCompletionTime {
  category_name: string;
  average_completion_time: number; // В секундах
}

interface FormattedCompletionTime {
  category_name: string;
  average_completion_time: string; // В формате "дни:часы:минуты"
}

interface AverageCompletionPageProps {
  average_completion_times: AverageCompletionTime[];
}

function parseIntervalToSeconds(interval: string): number {
  const regex = /(?:(\d+) day[s]?)?\s*(\d+):(\d+):([\d.]+)/;
  const match = interval.match(regex);

  if (!match) return 0;

  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const seconds = parseFloat(match[4] || '0');

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

export default function AverageCompletionPage({ average_completion_times: initialData }: AverageCompletionPageProps) {
  const [averageCompletionTimes, setAverageCompletionTimes] = useState<ParsedCompletionTime[] | null>(
    initialData?.map((item) => ({
      category_name: item.category_name,
      average_completion_time: parseIntervalToSeconds(item.average_completion_time),
    })) || [] // Если initialData не существует, возвращаем пустой массив
  );
  const [formattedCompletionTimes, setFormattedCompletionTimes] = useState<FormattedCompletionTime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/custom-query');
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Выводим данные для анализа

          // Проверяем, что данные содержат свойство average_completion_times, которое является массивом
          if (Array.isArray(data.average_completion_times)) {
            // Обрабатываем данные
            const parsedData = data.average_completion_times.map((item: any) => {
              if (item.category_name && item.average_completion_time) {
                return {
                  category_name: item.category_name,
                  average_completion_time: parseIntervalToSeconds(item.average_completion_time),
                };
              } else {
                console.error('Invalid item structure:', item);
                return null;
              }
            }).filter(Boolean); // Убираем null, если элемент не прошел проверку

            setAverageCompletionTimes(parsedData);

            // Форматируем данные для отображения
            const formattedData = parsedData.map((item: any) => {
              const totalSeconds = item.average_completion_time;
              const days = Math.floor(totalSeconds / 86400);
              const hours = Math.floor((totalSeconds % 86400) / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              return {
                category_name: item.category_name,
                average_completion_time: `${days}д ${hours}ч ${minutes}м`,
              };
            });

            setFormattedCompletionTimes(formattedData);
          } else {
            console.error('Received data.average_completion_times is not an array', data);
          }
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TailSpin height="80" width="80" color="#4fa94d" />
      </div>
    );
  }

  if (!averageCompletionTimes || averageCompletionTimes.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Нет данных для отображения.</p>
      </div>
    );
  }

  // Проверка, что есть данные перед рендером графика
  if (averageCompletionTimes.length > 0) {
    const labels = averageCompletionTimes.map((item) => item.category_name);
    const dataValues = averageCompletionTimes.map((item) => item.average_completion_time);

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Среднее время выполнения (сек)',
          data: dataValues,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              const totalSeconds = value;
              const days = Math.floor(totalSeconds / 86400);
              const hours = Math.floor((totalSeconds % 86400) / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              return `${days}д ${hours}ч ${minutes}м`;
            },
          },
          title: {
            display: true,
            text: 'Среднее время выполнения',
            font: {
              size: 16,
            },
          },
        },
        x: {
          title: {
            display: true,
            text: 'Категория',
            font: {
              size: 16,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const totalSeconds = context.parsed.y;
              const days = Math.floor(totalSeconds / 86400);
              const hours = Math.floor((totalSeconds % 86400) / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              return `${days}д ${hours}ч ${minutes}м`;
            },
          },
        },
        title: {
          display: true,
          text: 'Среднее время выполнения заявок по категориям',
          font: {
            size: 20,
          },
        },
      },
          
    };

    return (
      <div className="container p-6 mx-auto">
        <Bar data={data} options={options} />
      </div>
    );
  }

  return null; // В случае отсутствия данных
}
