import { useEffect, useState, useRef } from 'react';
import './index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import DayCard from './DayCard';
dayjs.locale('it');

function App() {
  const validMonths = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const today = dayjs('2025-04-07');
  const initialMonth = today.month() + 1;
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const currentYear = currentMonth > 8 ? 2024 : 2025;
  const [monthData, setMonthData] = useState({});
  const [nutritionData, setNutritionData] = useState({});
  const [loading, setLoading] = useState(true);
  const todayRef = useRef(null);

  useEffect(() => {
    const fetchJSON = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}menu-data.json`)
        const data = await response.json();
        const key = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
        setMonthData(data[key] || {});
        const response2 = await fetch(`${import.meta.env.BASE_URL}more-data.json`);
        const moreData = await response2.json();
        setNutritionData(moreData);
      } catch (error) {
        console.error('Errore durante il caricamento del JSON:', error);
      }
      setLoading(false);
    };

    setLoading(true);
    fetchJSON();
  }, [currentMonth]);

  useEffect(() => {
    if (loading) return;

    const scrollToRef = () => {
      if (today.month() + 1 !== currentMonth) return;
      if (todayRef.current) {
        const top = todayRef.current.getBoundingClientRect().top + window.pageYOffset - 60;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }

      // Trova il primo giorno disponibile dopo oggi
      const todayDay = today.date();
      const sortedDays = Object.keys(monthData)
        .map((d) => parseInt(d))
        .sort((a, b) => a - b);

      const nextDay = sortedDays.find((d) => d > todayDay);
      if (nextDay) {
        const el = document.querySelector(`[data-day="${nextDay}"]`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 60;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    };

    requestAnimationFrame(scrollToRef);
  }, [loading]);

  return (
    <div className="min-h-screen bg-sky-50 p-4 text-gray-800 font-sans text-2xl md:text-2xl">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              const index = validMonths.indexOf(currentMonth);
              if (index > 0) {
                const newMonth = validMonths[index - 1];
                setCurrentMonth(newMonth);
              }
            }}
            className="text-blue-900 text-xl px-2"
            aria-label="Mese precedente"
          >
            ‹
          </button>
          <h1 className="text-2xl font-bold text-center text-blue-900 flex-1">
            Menù di {dayjs(`${currentYear}-${currentMonth}-01`).format('MMMM YYYY')}
          </h1>
          <button
            onClick={() => {
              const index = validMonths.indexOf(currentMonth);
              if (index < validMonths.length - 1) {
                const newMonth = validMonths[index + 1];
                setCurrentMonth(newMonth);
              }
            }}
            className="text-blue-900 text-xl px-2"
            aria-label="Mese successivo"
          >
            ›
          </button>
        </div>
        <div className="text-center text-xs text-gray-500 mb-6">
          Webapp sviluppata da <span className="font-medium text-gray-700">Lucio Botteri</span><br />
          <a href="mailto:luciobotteri@gmail.com" className="text-blue-600 hover:underline">luciobotteri@gmail.com</a> ·{' '}
          <a href="https://www.linkedin.com/in/lucio-botteri" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>

        {loading ? (
          <p className="text-center">Sto caricando il menù...</p>
        ) : Object.keys(monthData).length === 0 ? (
          <p className="text-center text-sm text-gray-600">
            {dayjs(`${currentYear}-${currentMonth}-01`).isAfter(today, 'month')
              ? '👨🏻‍🍳 Il menù per questo mese non è ancora disponibile!'
              : '👨🏻‍🍳 Nessun menù disponibile per questo mese.'}
          </p>
        ) : (
          Object.entries(monthData).map(([day, menu]) => {
            const isToday = dayjs(`${currentYear}-${currentMonth}-${day}`, 'YYYY-M-D').isSame(today, 'day');
            const dayKey = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
            return (
              <DayCard
                day={day}
                menu={menu}
                isToday={isToday}
                dayKey={dayKey}
                moreData={nutritionData}
                todayRef={isToday ? todayRef : null}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
