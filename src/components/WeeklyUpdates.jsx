import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DataService from '../api/dataService';

const WeeklyUpdates = ({ data }) => {
  const [upcomingDays, setUpcomingDays] = useState([]);
  const [tempUnit] = useState('°c');

  useEffect(() => {
    data.shift();
    const formatted = data.map((day) => {
      day.sunrise = DataService.getDateTime(day.sunrise, 'time');
      day.sunset = DataService.getDateTime(day.sunset, 'time');
      day.date = DataService.getDateTime(day.dt, 'date');
      day.weekday = DataService.getWeekDay(day.dt);
      return day;
    });
    setUpcomingDays(formatted);
  }, [data]);

  return (
    upcomingDays.length > 0 && (
      <motion.div 
        className="p-5 rounded-xl backdrop-blur-md bg-black/20 border-t border-l border-white/5 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-light tracking-wide">
            <span className="text-white/60 text-xs uppercase tracking-widest block mb-1">Weekly Outlook</span>
            7-Day Forecast
          </h3>
        </div>
        
        <div className="scroll-container flex overflow-x-auto pb-2 -mx-2 scrollbar-hide">
          {upcomingDays.map((day, i) => (
            <motion.div
              key={`day${i + 1}`}
              className="flex-shrink-0 w-36 mx-2 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {/* Day header with gradient */}
              <div className="px-3 py-2 bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 backdrop-blur-sm">
                <div className="font-light text-base text-white tracking-wide">{day.weekday}</div>
                <div className="text-[10px] text-white/70 font-light">{day.date}</div>
              </div>
              
              {/* Weather icon and details */}
              <div className="px-3 py-2 bg-white/5 backdrop-blur-sm flex items-center space-x-2">
                <img
                  className="w-10 h-10"
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].main}
                />
                <div className="flex-1">
                  <div className="text-xs text-white/90 font-light max-w-15 truncate">{day.weather[0].description}</div>
                  <div className="flex justify-between text-white text-xs font-light">
                    <span>{Math.round(day.temp.max)}{tempUnit}</span>
                    <span className="text-white/60">{Math.round(day.temp.min)}{tempUnit}</span>
                  </div>
                </div>
              </div>
              
              {/* Weather details */}
              <div className="grid grid-cols-2 divide-x divide-y divide-white/5 text-center bg-white/5">
                <div className="py-2 px-1">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Humidity</div>
                  <div className="text-xs text-white font-light">{day.humidity}%</div>
                </div>
                <div className="py-2 px-1">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Rain</div>
                  <div className="text-xs text-white font-light">{day.pop ? `${Math.round(day.pop * 100)}%` : '0%'}</div>
                </div>
                <div className="py-2 px-1">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Sunrise</div>
                  <div className="text-xs text-white font-light">{day.sunrise}</div>
                </div>
                <div className="py-2 px-1">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Sunset</div>
                  <div className="text-xs text-white font-light">{day.sunset}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  );
};

export default WeeklyUpdates;