import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataService from '../api/dataService';

const HourlyUpdates = ({ data, timings }) => {
  const [nextHours, setNextHours] = useState([]);
  const [tempUnit] = useState('°c');
  const [sunTimings, setSunTimings] = useState([]);
  const [activeHour, setActiveHour] = useState(null);

  useEffect(() => {
    const formatted = data.map((hour) => ({
      dateTime: DataService.getDateTime(hour.dt),
      ...hour,
    }));
    setNextHours(formatted);
    const t = timings.map((t) => ({
      d: new Date(t * 1000).toLocaleDateString('en-US'),
      t: new Date(t * 1000).toLocaleTimeString('en-US'),
    }));
    setSunTimings(t);
  }, [data, timings]);

  const isDarkHour = (dt) => {
    const d = new Date(dt * 1000).toLocaleDateString('en-US');
    const day = sunTimings.filter((t) => t.d === d);
    if (day.length === 2) {
      const min = new Date(`${d} ${day[0].t}`);
      const max = new Date(`${d} ${day[1].t}`);
      return dt * 1000 > min && dt * 1000 < max ? false : true;
    }
    return false;
  };

  // Calculate temperature extremes for the gradient
  const temps = data.map(h => h.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);

  return (
    <motion.div 
      className="relative p-5 rounded-xl my-5 bg-black/20 backdrop-blur-md shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div 
          className="absolute w-1/2 h-1/2 rounded-full bg-cyan-400/30 blur-3xl"
          style={{
            top: '10%',
            left: '30%',
          }}
        />
        <div 
          className="absolute w-1/3 h-1/3 rounded-full bg-indigo-500/30 blur-3xl"
          style={{
            bottom: '20%',
            right: '20%',
          }}
        />
      </div>

      <div className="relative flex items-center justify-between mb-5">
        <h3 className="text-white text-sm font-light tracking-wide">
          <span className="text-white/60 text-xs uppercase tracking-widest block mb-1">48-Hour Forecast</span>
          Hourly Weather
        </h3>
        
        {/* Temperature scale legend */}
        <div className="flex items-center text-xs">
          <span className="text-white/60 mr-2 font-light">{Math.round(minTemp)}{tempUnit}</span>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-cyan-400/70 to-indigo-500/70" />
          <span className="text-white/60 ml-2 font-light">{Math.round(maxTemp)}{tempUnit}</span>
        </div>
      </div>

      {/* Timeline indicator */}
      <div className="relative h-0.5 bg-white/5 rounded-full mb-5 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400/80 to-indigo-500/80"
          initial={{ width: 0 }}
          animate={{ width: `${(100 / 48) * Math.min(data.length, 48)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      <div className="relative flex overflow-x-auto pb-2 -mx-2 scrollbar-hide force-scrollbar-hide">
        <div className="flex space-x-2 px-2">
          <AnimatePresence>
            {nextHours.map((hour, i) => {
              const isDark = isDarkHour(hour.dt);
              const tempPercentage = ((hour.temp - minTemp) / (maxTemp - minTemp)) * 100;
              
              return (
                <motion.div
                  key={`hr${i + 1}`}
                  className={`flex-shrink-0 w-20 py-3 px-2 rounded-lg flex flex-col items-center cursor-pointer transition-all ${activeHour === i ? 'ring-1 ring-white/20' : ''}`}
                  style={{ 
                    background: activeHour === i ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    backdropFilter: activeHour === i ? 'blur(8px)' : 'none'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => setActiveHour(i === activeHour ? null : i)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                >
                  <div className="text-center text-xs mb-1 font-light text-white/70">
                    {hour.dateTime.time.split(':')[0]}h
                  </div>
                  
                  <div className="relative w-10 h-10 mb-1">
                    <img
                      className="w-full h-full object-contain"
                      src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                      alt={hour.weather[0].main}
                    />
                  </div>
                  
                  <div className="text-center text-xs font-light text-white">
                    {Math.round(hour.temp)}{tempUnit}
                  </div>
                  
                  {/* Temperature indicator dot */}
                  <div className="mt-2 w-full flex justify-center">
                    <div 
                      className="w-1 h-1 rounded-full"
                      style={{
                        backgroundColor: isDark ? 'rgba(165, 180, 252, 0.8)' : 'rgba(103, 232, 249, 0.8)',
                        transform: `scale(${0.8 + (tempPercentage/100)})`
                      }}
                    />
                  </div>
                  
                  {/* Expanded details */}
                  {activeHour === i && (
                    <motion.div 
                      className="mt-2 pt-2 border-t border-white/10 w-full text-center"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="text-xs text-white/80 mb-1 font-light">{hour.weather[0].description}</div>
                      <div className="flex justify-between text-[10px] text-white/50 font-light">
                        <span>💧 {hour.humidity}%</span>
                        <span>🌬️ {hour.wind_speed}m/s</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default HourlyUpdates;