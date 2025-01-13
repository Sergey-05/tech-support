import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DatePicker } from '@mui/x-date-pickers';
// import { DatePicker } from '@mui/x-date-pickers-pro';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    request_date: new Date(),
    request_time_left: '12:00', // время по умолчанию
  });

  // Обработчик изменения даты
  const handleDateChange = (date: Date) => {
    setFormData({
      ...formData,
      request_date: date,
    });
  };

  // Обработчик изменения времени
  const handleTimeChange = (time: string) => {
    setFormData({
      ...formData,
      request_time_left: time,
    });
  };

  return (
    <form>
      <DatePicker/>
        {/* <Calendar/>
      {/* Выбор даты */}
      {/* <div>
        <label className="block text-sm font-medium">Выберите дату</label>
        <DatePicker
          selected={formData.request_date}
          onChange={handleDateChange}
          minDate={new Date()}
          dateFormat="dd/MM/yyyy"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Выбор времени */}
      {/* <div className="flex items-center mt-4">
        <label className="block text-sm font-medium">Желаемое время выполнения</label>
        <div className="ml-4">
          <TimePicker
            onChange={handleTimeChange}
            value={formData.request_time_left}
            disableClock
            format="HH:mm"
            clearIcon={null}
          />
        </div>
      </div> */}
    </form>
  );
};

export default RequestForm;
