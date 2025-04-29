import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

function DayCard({ day, menu, isToday, dayKey, todayRef, moreData }) {

  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.8519&longitude=14.2389&current_weather=true');
        const data = await res.json();
        const weatherInfo = data.current_weather;
        if (weatherInfo && typeof weatherInfo.temperature === 'number') {
          const emoji = weatherInfo.weathercode < 3
            ? '☀️'
            : weatherInfo.weathercode < 6
            ? '🌥️'
            : weatherInfo.weathercode < 9
            ? '🌧️'
            : '🌩️';
          setWeather(`${weatherInfo.temperature}°C ${emoji}`);
        }
      } catch (err) {
        console.error("Errore meteo Open-Meteo:", err);
      }
    };
    getWeather();
  }, []);

  const analysisText = moreData?.[dayKey]?.analisi;
  const tipText = moreData?.[dayKey]?.consiglio;

  return (
    <div
      className={`mb-4 rounded-lg p-4 shadow-sm ${isToday ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-white'}`}
      ref={todayRef}
      data-day={day}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold">
          {dayjs(`${dayKey}`).format('dddd D MMMM').replace(/^\w/, (c) => c.toUpperCase())}
          {isToday && <span className="ml-2 text-sm text-yellow-700">(Oggi!)</span>}
        </div>
        {isToday && weather && (
          <div className="text-sm text-gray-600">
            <span className="text-2xl mr-1">{weather.split(' ')[1]}</span>{weather.split(' ')[0]}
          </div>
        )}
      </div>
      <div className="text-base leading-snug whitespace-pre-line">
        {menu
          .split(/[,;\n]/)
          .map(item => item.trim())
          .filter(Boolean)
          .map(item => `• ${item}`)
          .join('\n')}
      </div>
      {analysisText || tipText ? (
        <div className="mt-4 pt-2 border-t text-sm text-gray-700">
          <div className="font-semibold text-gray-800 mb-1">Valutazione nutrizionale</div>
          {analysisText && <div className="italic text-gray-600">{analysisText}</div>}
          {tipText && <div className="mt-1">{tipText}</div>}
        </div>
      ) : null}
    </div>
  );
}

export default DayCard;