'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface DatePickerWheelsProps {
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
}

const DatePickerWheels: React.FC<DatePickerWheelsProps> = ({
  onDateChange,
  initialDate = new Date(2002, 3, 18)
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate?.getFullYear() || 2002);
  const [selectedMonth, setSelectedMonth] = useState(initialDate?.getMonth() + 1 || 4);
  const [selectedDay, setSelectedDay] = useState(initialDate?.getDate() || 18);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear]);
  const months = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], []);
  const getDaysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1),
    [selectedYear, selectedMonth]
  );

  // Update state when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedYear(initialDate.getFullYear());
      setSelectedMonth(initialDate.getMonth() + 1);
      setSelectedDay(initialDate.getDate());
    }
  }, [initialDate]);

  useEffect(() => {
    const newDaysCount = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > newDaysCount) {
      setSelectedDay(newDaysCount);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(new Date(selectedYear, selectedMonth - 1, selectedDay));
    }
  }, [selectedYear, selectedMonth, selectedDay, onDateChange]);

  return (
    <div className="relative w-[297px] mx-auto">
      <div
        className="w-full rounded-[14px] p-5 pt-[18px] flex flex-col gap-4"
        style={{
          background: 'linear-gradient(160deg, #1b1c1e 0%, #232527 55%, #1a1b1d 100%)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div className="flex flex-row gap-2">
          <label className="flex-1">
            <span className="block text-[12px] tracking-[0.08em] uppercase text-white/60 mb-2">Year</span>
            <select
              className="date-select"
              value={selectedYear}
              onChange={event => setSelectedYear(Number(event.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year} className="text-black">
                  {year}년
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1">
            <span className="block text-[12px] tracking-[0.08em] uppercase text-white/60 mb-2">Month</span>
            <select
              className="date-select"
              value={selectedMonth}
              onChange={event => setSelectedMonth(Number(event.target.value))}
            >
              {months.map(month => (
                <option key={month} value={month} className="text-black">
                  {month}월
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1">
            <span className="block text-[12px] tracking-[0.08em] uppercase text-white/60 mb-2">Day</span>
            <select
              className="date-select"
              value={selectedDay}
              onChange={event => setSelectedDay(Number(event.target.value))}
            >
              {days.map(day => (
                <option key={day} value={day} className="text-black">
                  {day}일
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <style jsx>{`
        .date-select {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          padding: 0 12px;
          color: #f5f5f0;
          background: linear-gradient(180deg, #2c2f33 0%, #26282b 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          letter-spacing: 0.01em;
        }
        .date-select:focus {
          outline: none;
          border-color: rgba(221, 178, 110, 0.6);
          box-shadow: 0 0 0 3px rgba(221, 178, 110, 0.16);
        }
      `}</style>
    </div>
  );
};

export default DatePickerWheels;