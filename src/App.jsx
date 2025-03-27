import { useEffect, useState, useRef } from 'react';
import './index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
dayjs.locale('it');

function App() {
  const validMonths = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const initialMonth = dayjs().month() + 1;
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [monthData, setMonthData] = useState({});
  const [nutritionData, setNutritionData] = useState({});
  const [loading, setLoading] = useState(true);
  const today = dayjs();
  const todayRef = useRef(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchJSON = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}menu-data.json`)
        const data = await response.json();
        const key = `${currentMonth > 8 ? 2024 : 2025}-${currentMonth.toString().padStart(2, '0')}`;
        setMonthData(data[key] || {});
        const response2 = await fetch(`${import.meta.env.BASE_URL}more-data.json`);
        const moreData = await response2.json();
        setNutritionData(moreData);
      } catch (error) {
        console.error('Errore durante il caricamento del JSON:', error);
      }

      try {
        const weatherResp = await fetch("https://wttr.in/Napoli?format=%c+%t");
        const weatherText = await weatherResp.text();
        setWeather(weatherText);
      } catch (err) {
        console.error("Errore nel recupero meteo:", err);
      }

      setLoading(false);
    };

    setLoading(true);
    fetchJSON();
  }, [currentMonth]);

  useEffect(() => {
    if (!loading && todayRef.current) {
      requestAnimationFrame(() => {
        const top = todayRef.current.getBoundingClientRect().top + window.pageYOffset - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    }
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
            Menù di {dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-01`).format('MMMM YYYY')}
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
          <p className="text-center">Caricamento...</p>
        ) : Object.keys(monthData).length === 0 ? (
          <p className="text-center text-sm text-gray-600">
            {dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-01`).isAfter(today, 'month')
              ? '👨🏻‍🍳 Il menù per questo mese non è ancora disponibile!'
              : '👨🏻‍🍳 Nessun menù disponibile per questo mese.'}
          </p>
        ) : (
          Object.entries(monthData).map(([day, menu]) => {
            const isToday = dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-${day}`, 'YYYY-M-D').isSame(today, 'day');
            return (
              <div
                key={day}
                ref={isToday ? todayRef : null}
                data-today={isToday ? true : undefined}
                className={`rounded-2xl px-5 py-4 shadow-md mb-4 transition-all ${
                  isToday ? 'bg-purple-600 text-white' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">
                    {dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-${day}`, 'YYYY-M-D').format('dddd D MMMM').replace(/^./, s => s.toUpperCase())}
                    {isToday && ' (Oggi!)'}
                  </h2>
                  {isToday && weather && (
                    <p className="text-sm text-white italic">
                      {weather.slice(1)}<span className="text-3xl ml-2">{weather.charAt(0)}</span>
                    </p>
                  )}
                </div>
                <ul className="list-disc list-inside text-base space-y-1 mb-6">
                  {menu
                    .split(/[,;\n]/)
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .map((item, i) => (
                      <li key={i}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </li>
                    ))}
                </ul>
                {nutritionData[`2025-${currentMonth.toString().padStart(2, '0')}-${day.padStart(2, '0')}`] && (
                  <div className="mt-3 text-base leading-relaxed space-y-5">
                    <p className="mb-1"><strong>🔍 Analisi nutrizionale:</strong><br />{nutritionData[`2025-${currentMonth.toString().padStart(2, '0')}-${day.padStart(2, '0')}`].analisi}</p>
                    <p><strong>💬 Consiglio per il resto della giornata:</strong><br />{nutritionData[`2025-${currentMonth.toString().padStart(2, '0')}-${day.padStart(2, '0')}`].consiglio}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
