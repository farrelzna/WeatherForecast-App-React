"use client"

import { useState, useEffect } from "react"
import { useIdleTimer } from "react-idle-timer"
import axios from "axios"

import WeeklyUpdates from "./components/WeeklyUpdates"
import HourlyUpdates from "./components/HourlyUpdates"
import CurrentUpdate from "./components/CurrentUpdate"
import Sidebar from "./components/Sidebar"
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

  return (
    <div className={`main-container ${bgClass} ${drawerShown ? " drawer-open" : ""}`}>
      <div className="left" onClick={(e) => setMinimalView(false)}>
        {weatherLoading ? (
          <div className="loading">Fetching weather data...</div>
        ) : weatherError ? (
          <div className="error-message">{weatherErrorMsg}</div>
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
        !weatherLoading &&
        !weatherError && <div className="grabber" onClick={(e) => setDrawerShown(!drawerShown)}></div>
      )}
    </div>
  )
}

export default App