
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from "react";
import DataService from '../api/dataService';

// Import icons
import pinIcon from '../assets/icons/pin.png';
import dropIcon from '../assets/icons/drop.png';
import windIcon from '../assets/icons/wind.png';

import sunriseIcon from '../assets/icons/sunrise.png';
import sunsetIcon from '../assets/icons/sunset.png';
import visibilityIcon from '../assets/icons/visibility.png';
import barometerIcon from '../assets/icons/barometer.png';
import rainIcon from '../assets/icons/rain.png';

const CurrentUpdate = ({ data, dailydata, timings, name }) => {
  const [tempUnit] = useState('°c');
  const [windSpeedUnit] = useState('mt/s');
  const [windDirection, setWindDirection] = useState(null);
  const [tempData] = useState(dailydata.temp);
  const [rainChance] = useState(dailydata.rain);

  useEffect(() => {
    const direction = DataService.getCardinalDirection(data.wind_deg);
    setWindDirection(direction);
  }, [data]);

  const funFacts = useMemo(() => [
    "The highest temperature ever recorded on Earth was 56.7°C (134°F) in Death Valley, California!",
    "Snowflakes can take up to an hour to fall from the cloud to the ground!",
    "A bolt of lightning is five times hotter than the surface of the sun.",
    "The coldest temperature ever recorded was -89.2°C (-128.6°F) in Antarctica.",
    "Rain contains vitamin B12, which is vital for the human body (in tiny amounts)."
  ], []);

  const randomFact = useMemo(() => {
    return funFacts[Math.floor(Math.random() * funFacts.length)];
  }, [funFacts]);

  const darkIcons = ['01n', '13d', '13n', '50d', '50n'];

  const Icon = ({ iconUrl, alt, size = 30, className = '' }) => (
    <motion.img
      src={iconUrl}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{
        objectFit: 'contain',
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400 }}
    />
  );

  return (
    <motion.div
      className="w-full grid grid-cols-1 lg:grid-cols-12 mt-15 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Weather Card - Left Column */}
      <motion.div
        className="glass-panel p-6 rounded-xl flex flex-col justify-between lg:col-span-5 shadow-xl backdrop-blur-md bg-black/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        whileHover={{ scale: 1.005 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Location and Temp */}
          <div className="flex flex-col items-center md:items-start">
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Icon iconUrl={pinIcon} alt="Location Pin" size={18} />
              <span className="text-sm font-light tracking-wider text-white/90">{name}</span>
            </motion.div>

            <motion.div
              className="text-[90px] font-extralight leading-none text-white drop-shadow-lg flex items-end"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              {data.temp}
              <sup className="text-[30px] opacity-70 align-super font-thin">{tempUnit}</sup>
            </motion.div>

            <motion.div
              className="mt-3 text-base text-white/90 font-light tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {data.weather[0].main}
            </motion.div>

            <motion.div
              className="mt-1 text-xs text-white/60 font-extralight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Feels like {data.feels_like}{tempUnit}
            </motion.div>
          </div>

          {/* Weather Icon */}
          <motion.div
            className={`icon ${darkIcons.includes(data.weather[0]?.icon) ? 'inv filter invert' : ''}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            {data.weather && data.weather[0] && data.weather[0].icon ? (
              <img
                className="city-icon"
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
                alt={data.weather[0].main}
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span>No icon</span>
            )}
          </motion.div>
        </div>

        {/* Hi/Lo Temp */}
        <motion.div
          className="flex justify-start gap-6 mt-6 border-t border-white/10 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">High</span>
            <span className="text-base text-white font-light">{tempData.max}<sup>{tempUnit}</sup></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 uppercase tracking-wider">Low</span>
            <span className="text-base text-white font-light">{tempData.min}<sup>{tempUnit}</sup></span>
          </div>
        </motion.div>
      </motion.div>

      {/* Info Panel - Middle Column */}
      <motion.div
        className="glass-panel p-5 rounded-xl flex flex-col lg:col-span-4 shadow-xl backdrop-blur-md bg-black/20"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ scale: 1.005 }}
      >
        <h3 className="text-xs uppercase tracking-widest text-white/60 mb-3 font-light">Weather Details</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: dropIcon, label: 'Humidity', value: `${data.humidity}%` },
            { icon: windIcon, label: 'Wind', value: `${windDirection} ${data.wind_speed} ${windSpeedUnit}` },
            { icon: barometerIcon, label: 'Pressure', value: `${data.pressure} hPa` },
            { icon: visibilityIcon, label: 'Visibility', value: `${Math.round(data.visibility / 1000)} km` },
            { icon: rainIcon, label: 'Rain Chance', value: `${Math.round(rainChance * 100)}%` },
            ...(data.dt < data.sunrise ? [
              { icon: sunriseIcon, label: 'Sunrise', value: DataService.getDateTime(data.sunrise, 'time') }
            ] : []),
            ...(data.dt >= data.sunrise && data.dt < data.sunset ? [
              { icon: sunsetIcon, label: 'Sunset', value: DataService.getDateTime(data.sunset, 'time') }
            ] : []),
            ...(data.dt >= data.sunset ? [
              { icon: sunriseIcon, label: 'Sunrise', value: DataService.getDateTime(timings[2], 'time') }
            ] : [])
          ].map((item, index) => (
            <motion.div
              key={`${item.label}-${index}`}
              className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
              whileHover={{ x: 2 }}
            >
              <Icon iconUrl={item.icon} alt={item.label} size={20} />
              <div className="flex justify-between w-full">
                <div className="text-xs font-light text-white/70">{item.label}</div>
                <div className="text-xs text-white font-light">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fun Fact Card - Right Column */}
      <motion.div
        className="glass-panel p-5 rounded-xl flex flex-col justify-between lg:col-span-3 shadow-xl backdrop-blur-md bg-black/20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.005 }}
      >
        <div>
          <h3 className="text-xs uppercase tracking-widest text-white/60 mb-3 font-light">Weather Insight</h3>
          <motion.div
            className="p-4 rounded-lg bg-gradient-to-br from-white/5 to-white/10 text-white/80 shadow-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Did you know?</p>
            <p className="text-xs font-light">{randomFact}</p>
          </motion.div>
        </div>
        <div className="mt-auto pt-4 text-right text-white/40 text-xs font-light">
          Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CurrentUpdate;
