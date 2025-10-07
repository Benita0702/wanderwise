import React, { useState } from 'react';

const Calendar = ({ mode = 'single', selected, onSelect, initialFocus, ...props }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Simple calendar implementation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 text-center opacity-50" />);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isSelected = selected && 
      selected.getDate() === day && 
      selected.getMonth() === month && 
      selected.getFullYear() === year;
    
    days.push(
      <div
        key={day}
        onClick={() => onSelect && onSelect(date)}
        className={`p-2 text-center cursor-pointer rounded-md hover:bg-gray-100 ${
          isSelected ? 'bg-blue-500 text-white' : ''
        }`}
      >
        {day}
      </div>
    );
  }
  
  // Month navigation
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  
  return (
    <div className="p-3 bg-white rounded-md border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
          &lt;
        </button>
        <div className="font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export { Calendar };