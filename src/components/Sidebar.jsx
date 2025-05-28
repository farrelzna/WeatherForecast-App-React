import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWeather } from '../api/fetchWeather';

const Sidebar = ({ klass, onPlaceClicked, onCloseClicked }) => {
  const [tempUnit] = useState('°c');
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);

  function inputChange(e) {
    setQuery(e.target.value);
  }

  const search = async (e) => {
    if (e.key === 'Enter') {
      setSearching(true);
      try {
        const data = await fetchWeather(query);
        setSearchCompleted(true);
        setSearching(false);
        setWeather(data);
        setQuery('');
      } catch (error) {
        setSearchCompleted(true);
        setWeather(null);
        setSearching(false);
      }
    }
  };

  const selectPlace = (e) => {
    onCloseClicked(true);
    onPlaceClicked(e);
  };

  return (
    <>
      {/* Elegant backdrop blur */}
      <motion.div 
        className={`absolute inset-0 backdrop-blur-xl ${klass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/80"></div>
      </motion.div>
      
      {/* Content container */}
      <motion.div 
        className={`absolute inset-0 z-[1] p-8 overflow-auto ${klass.includes('night') ? 'night' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Close button */}
        <motion.div 
          className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer text-white text-xl transition-all duration-200"
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => onCloseClicked(true)}
        >
          <span className="transform translate-y-[-3px]">&times;</span>
        </motion.div>
        
        {/* Search box */}
        <div className="mt-15 mb-10">
          <div className="relative">
            <motion.input
              type="text"
              className="w-full py-3 px-4 bg-white/5 border-none rounded-lg text-white text-base font-light tracking-wide placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 backdrop-blur-md transition-all duration-300"
              placeholder="Search location..."
              value={query}
              onChange={inputChange}
              onKeyPress={search}
              autoComplete="off"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/30 text-xs font-light">
              Press Enter
            </div>
          </div>
        </div>
        
        {/* Searching indicator */}
        <AnimatePresence>
          {searching && (
            <motion.div 
              className="py-2 text-white/60 font-light text-sm tracking-wide"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"></div>
                Searching...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search results */}
        <AnimatePresence>
          {searchCompleted && !searching && (
            <motion.div 
              className="mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {weather ? (
                <motion.div 
                  className="p-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg cursor-pointer overflow-hidden"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => selectPlace(weather)}
                  layout
                >
                  <div className="flex justify-between items-center">
                    <div className="place-info">
                      <h3 className="text-lg font-light text-white tracking-wide mb-1">
                        {weather.name}, <span className="text-white/70 text-sm">{weather.sys.country}</span>
                      </h3>
                      <p className="text-xs text-white/60 font-light tracking-wide">
                        {weather.weather[0].description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-2xl font-extralight text-white mr-1">
                        {Math.round(weather.main.temp)}{tempUnit}
                      </div>
                      <div className="w-10 h-10">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                          alt={weather.weather[0].description}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="p-4 text-white/50 text-sm font-light tracking-wide text-center bg-white/5 backdrop-blur-md rounded-lg border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  No results found
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Sidebar;