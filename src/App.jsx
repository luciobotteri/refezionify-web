import { useEffect, useState } from 'react';
import './index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
dayjs.locale('it');

function App() {
  const validMonths = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const initialMonth = dayjs().month() + 1;
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [monthData, setMonthData] = useState({});
  const [loading, setLoading] = useState(true);
  const today = dayjs();

  const monthCode = (month) => {
    const codes = {
      1: '3259',
      2: '3260',
      3: '3261',
      4: '3262',
      5: '3263',
      6: '14357',
      9: '3247',
      10: '3250',
      11: '3251',
      12: '3258',
    };
    return codes[month] || '';
  };

  useEffect(() => {
    const fetchMenu = async () => {
      const code = monthCode(currentMonth);
      if (!code) return;

      try {
        const response = await fetch(
          `/comune-proxy/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/${code}`
        );
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = Array.from(doc.querySelectorAll('table.viewTable tr'));

        const parsed = {};

        for (let row of rows) {
          const dateCell = row.querySelector('div.viewTableHCCellText');
          const menuCell = row.querySelector('div.viewTableCellText');

          if (dateCell && menuCell) {
            const dateText = dateCell.textContent.trim().toLowerCase();
            const menu = menuCell.textContent.trim();

            const dateMatch = dateText.match(/(\d{1,2})\s+[a-z]+/i);
            if (!dateMatch) continue;

            const day = parseInt(dateMatch[1]);
            if (!isNaN(day)) {
              parsed[day] = menu;
            }
          }
        }

        setMonthData(parsed);
      } catch (error) {
        console.error("Errore durante il parsing:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchMenu();
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-sky-50 p-4 text-gray-800 font-sans">
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
        ) : (
          Object.entries(monthData).map(([day, menu]) => {
            const isToday = dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-${day}`, 'YYYY-M-D').isSame(today, 'day');
            return (
              <div
                key={day}
                className={`rounded-2xl px-5 py-4 shadow-md mb-4 transition-all ${
                  isToday ? 'bg-purple-500 text-white' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-lg">
                    {dayjs(`${currentMonth > 8 ? 2024 : 2025}-${currentMonth}-${day}`, 'YYYY-M-D').format('dddd D MMMM')}
                    {isToday && ' (Oggi!)'}
                  </h2>
                </div>
                <ul className="list-disc list-inside text-sm space-y-1">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
