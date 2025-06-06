"use client"

import { useState, useEffect } from "react"
import { useIdleTimer } from "react-idle-timer"
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios"

import WeeklyUpdates from "./components/WeeklyUpdates"
import HourlyUpdates from "./components/HourlyUpdates"
import CurrentUpdate from "./components/CurrentUpdate"
// import Sidebar from "./components/Sidebar"
import { fetchCurrentWeather } from "./api/fetchWeather"
import DataService from "./api/dataService"
import "./Weather.css"
import "./App.css"

const App = () => {
  const API_KEY = "ac9d21f60ea5a2b193883ac1cfb90618"
  const [rawData, setRawData] = useState(null)
  const [bgClass, setBGClass] = useState("")
  const [drawerShown, setDrawerShown] = useState(false)
  const [minimalView, setMinimalView] = useState(true)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [weatherError, setWeatherError] = useState(false)
  const [weatherErrorMsg, setWeatherErrorMsg] = useState("Failed to load data.")
  const [placeName, setPlaceName] = useState("")

  const [currentUpdate, setCurrentUpdate] = useState(null)
  const [hourlyUpdates, setHourlyUpdates] = useState([])
  const [dailyUpdates, setDailyUpdates] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [sunTimings, setSunTimings] = useState([])

  const handleOnIdle = () => {
    if (!drawerShown) {
      setMinimalView(true)
    }
  }

  // Fetch coordinates for a city name
  const fetchCoordinates = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ac9d21f60ea5a2b193883ac1cfb90618&units=metric`,
      )
      return {
        coord: response.data.coord,
        name: `${response.data.name}, ${response.data.sys.country}`,
      }
    } catch (error) {
      console.error("Geocoding error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "City not found")
    }
  }

  useEffect(() => {
    const loadDefaultCity = async () => {
      // Check if API key is available
      if (!API_KEY) {
        setWeatherLoading(false)
        setWeatherError(true)
        setWeatherErrorMsg("API key not configured. Please check your environment variables.")
        return
      }

      const storedCity = localStorage.getItem("defaultCity") || "Bogor"
      setWeatherLoading(true)

      try {
        const place = await fetchCoordinates(storedCity)
        await fetchWeather(place)
      } catch (error) {
        console.error("Error loading default city:", error)
        setWeatherLoading(false)
        setWeatherError(true)
        setWeatherErrorMsg(`Failed to load weather for ${storedCity}: ${error.message}`)
      }
    }

    loadDefaultCity()
  }, [])

  const fetchWeather = async (place, cache = true) => {
    const { lat, lon } = place.coord
    setPlaceName(place.name)
    setWeatherLoading(true)
    setWeatherError(false)
    setWeatherErrorMsg("")

    try {
      const data = await fetchCurrentWeather({ lat, lon, cache })
      if (!data) {
        throw new Error("No weather data received")
      }
      setRawData(data)
      populate(data)
      localStorage.setItem("defaultCity", place.name.split(",")[0].trim())
    } catch (error) {
      console.error("Fetch weather error:", error)
      setWeatherError(true)
      setWeatherErrorMsg(`Failed to fetch weather: ${error.message}`)
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleSearch = async (city) => {
    if (!city.trim()) return

    setWeatherLoading(true)
    try {
      const place = await fetchCoordinates(city)
      await fetchWeather(place, false)
    } catch (error) {
      setWeatherError(true)
      setWeatherErrorMsg("City not found. Please try another location.")
    } finally {
      setWeatherLoading(false)
    }
  }

  function populate(data) {
    setCurrentUpdate(data.current)
    setHourlyUpdates(data.hourly)
    setDailyUpdates(data.daily)

    setDailyData({
      temp: data.daily[0].temp,
      rain: data.daily[0].pop,
    })

    setSunTimings([
      data.daily[0].sunrise,
      data.daily[0].sunset,
      data.daily[1].sunrise,
      data.daily[1].sunset,
      data.daily[2].sunrise,
      data.daily[2].sunset,
    ])

    setBGClass(DataService.getBackgroundClass(data.current.weather[0].icon, data.current.weather[0].id))
  }

  useIdleTimer({
    timeout: 1000 * 30,
    onIdle: handleOnIdle,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearchInput = async (value) => {
    setSearchQuery(value)
    if (value.trim().length >= 2) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${API_KEY}&limit=5`
        )
        setSuggestions(response.data.list.map(city => `${city.name}, ${city.sys.country}`))
        setShowSuggestions(true)
      } catch (error) {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = async (city) => {
    setSearchQuery(city)
    setShowSuggestions(false)
    await handleSearch(city)
  }

  return (
    <div className={`main-container ${bgClass} ${drawerShown ? " drawer-open" : ""}`}>
      {/* Search Bar */}
      <div className="search-container fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl mx-auto">
        <div className="relative group">
          <motion.div
            className="absolute inset-0 bg-black/10 backdrop-blur-xl rounded-2xl -m-1 transition-all duration-300 group-hover:bg-black/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.input
            type="text"
            className="w-full py-4 px-6 bg-transparent rounded-xl text-xs text-white text-base font-light tracking-wide placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/2 shadow-lg transition-all duration-300 relative z-10"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
                setSearchQuery('');
                setShowSuggestions(false);
              }
            }}
            autoComplete="off"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          />
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/40 text-xs font-light transition-all duration-300 group-hover:text-white/60 z-10">
            Press Enter
          </div>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="absolute w-full mt-2 bg-black/10 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {weatherLoading && (
          <motion.div 
            className="py-3 px-6 mt-2 text-white/60 font-light text-xs tracking-wide bg-black/10 backdrop-blur-md rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"></div>
              <span>Searching...</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="left" onClick={(e) => setMinimalView(false)}>
        {weatherLoading ? (
          <div className="loading flex items-center justify-center h-full text-white/80">
            <div className="w-8 h-8 mr-3 rounded-full border-4 border-white/30 border-t-white/90 animate-spin"></div>
            Fetching weather data...
          </div>
        ) : weatherError ? (
          <div className="error-message flex items-center justify-center h-full text-center">
            <div className="bg-black-500/10 backdrop-blur-md p-8 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white/70 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-semibold text-white/90 mb-2">Oops! Something went wrong.</p>
              <p className="text-xs text-white/70">{weatherErrorMsg}</p>
            </div>
          </div>
        ) : (
          rawData && (
            <>
              <CurrentUpdate
                data={currentUpdate}
                dailydata={dailyData}
                timings={sunTimings}
                miniview={minimalView}
                name={placeName}
              />
              <HourlyUpdates data={hourlyUpdates} timings={sunTimings} />
              <WeeklyUpdates data={dailyUpdates} />
              {(
                <div className="footer">
                  Data provided by{" "}
                  <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">
                    openweathermap
                  </a>
                </div>
              )}
            </>
          )
        )}
      </div>

      {drawerShown ? (
        <div className="right">
          <Sidebar
            onCloseClicked={() => setDrawerShown(false)}
            onPlaceClicked={(place) => fetchWeather(place, false)}
            klass={bgClass}
          />
        </div>
      ) : (
        !weatherLoading
      )}
    </div>
  );
}

export default App;