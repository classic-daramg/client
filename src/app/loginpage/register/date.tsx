'use client';

import React, { useState, useRef, useEffect } from 'react';

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

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Update state when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedYear(initialDate.getFullYear());
      setSelectedMonth(initialDate.getMonth() + 1);
      setSelectedDay(initialDate.getDate());
    }
  }, [initialDate]);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    items: number[],
    setter: (value: number) => void
  ): void => {
    if (!ref.current) return;

    const container = ref.current;
    const itemHeight = 35; // Height of each item
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

    setter(items[clampedIndex]);

    // Smooth snap to the nearest item with a slight delay
    setTimeout(() => {
      if (container) {
        container.scrollTo({
          top: clampedIndex * itemHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  useEffect(() => {
    // Update days when year or month changes
    const newDaysCount = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > newDaysCount) {
      setSelectedDay(newDaysCount);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(new Date(selectedYear, selectedMonth - 1, selectedDay));
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const itemHeight = 35;

    if (yearRef.current) {
      const yearIndex = years.findIndex(year => year === selectedYear);
      if (yearIndex >= 0) {
        yearRef.current.scrollTop = yearIndex * itemHeight;
      }
    }

    if (monthRef.current) {
      const monthIndex = months.findIndex(month => month === selectedMonth);
      if (monthIndex >= 0) {
        monthRef.current.scrollTop = monthIndex * itemHeight;
      }
    }

    if (dayRef.current) {
      const dayIndex = days.findIndex(day => day === selectedDay);
      if (dayIndex >= 0) {
        dayRef.current.scrollTop = dayIndex * itemHeight;
      }
    }
  }, [selectedYear, selectedMonth, selectedDay, years, months, days]);

  interface WheelColumnProps {
    items: number[];
    selectedValue: number;
    onScroll: (
      ref: React.RefObject<HTMLDivElement | null>,
      items: number[],
      setter: (value: number) => void
    ) => void;
    formatter?: (item: number) => string;
    scrollRef: React.RefObject<HTMLDivElement | null>;
  }

  const WheelColumn: React.FC<WheelColumnProps> = ({ 
    items, 
    selectedValue, 
    onScroll, 
    formatter, 
    scrollRef 
  }) => (
    <div className="relative flex-1 h-[177px] overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll date-picker-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          paddingTop: '71px',
          paddingBottom: '71px'
        }}
        onScroll={() => onScroll(scrollRef, items, (value: number) => {
          if (items === years) setSelectedYear(value);
          else if (items === months) setSelectedMonth(value);
          else setSelectedDay(value);
        })}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="h-[35px] flex items-center justify-center text-white text-lg font-medium scroll-snap-align-start"
            style={{
              opacity: item === selectedValue ? 1 : 0.6,
            }}
          >
            {formatter ? formatter(item) : item}
          </div>
        ))}
      </div>
    </div>
  );
   
  return (
    <div className="relative w-[297px] h-[213px] mx-auto">
      {/* Container with backdrop blur effect */}
      <div
        className="relative w-full h-full rounded-[13px] p-5 pt-[18px] flex flex-col gap-[10px] isolate"
        style={{
          filter: 'drop-shadow(0px 10px 60px rgba(0, 0, 0, 0.1))',
          background: 'linear-gradient(0deg, #383838, #383838)',
          backdropFilter: 'blur(25px)',
        }}
      >
        {/* Selection highlight */}
        <div
          className="absolute left-0 w-[297px] h-[35px] top-[89px] rounded-[7px]"
          style={{
            background: 'rgba(120, 120, 128, 0.2)',
            border: '1px solid rgba(120, 120, 128, 0.3)'
          }}
        />

        {/* Top fade overlay */}
        <div
          className="absolute left-0 right-0 top-[18px] h-[71px] pointer-events-none rounded-t-[13px]"
          style={{
            background: 'linear-gradient(180deg, rgba(56, 56, 56, 0.9) 0%, rgba(56, 56, 56, 0) 100%)'
          }}
        />

        {/* Bottom fade overlay */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[71px] pointer-events-none rounded-b-[13px]"
          style={{
            background: 'linear-gradient(180deg, rgba(56, 56, 56, 0) 0%, rgba(56, 56, 56, 0.9) 100%)'
          }}
        />

        {/* Wheels container */}
        <div className="flex flex-row w-[257px] h-[177px] relative z-10">
          {/* Year wheel */}
          <WheelColumn
            items={years}
            selectedValue={selectedYear}
            onScroll={handleScroll}
            formatter={(year) => `${year}년`}
            scrollRef={yearRef}
          />

          {/* Month wheel */}
          <WheelColumn
            items={months}
            selectedValue={selectedMonth}
            onScroll={handleScroll}
            formatter={(month) => monthNames[month - 1]}
            scrollRef={monthRef}
          />

          {/* Day wheel */}
          <WheelColumn
            items={days}
            selectedValue={selectedDay}
            onScroll={handleScroll}
            formatter={(day) => `${day}일`}
            scrollRef={dayRef}
          />
        </div>
      </div>

      <style jsx>{`
        .date-picker-scroll::-webkit-scrollbar {
          display: none;
        }
        .date-picker-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DatePickerWheels;