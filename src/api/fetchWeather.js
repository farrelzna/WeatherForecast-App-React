import axios from "axios"
import DataService from "./dataService"
// import data from '../data.json';

const URL = "https://api.openweathermap.org/data/2.5/onecall"
const SEARCHURL = "https://api.openweathermap.org/data/2.5/weather"
const API_KEY = "ac9d21f60ea5a2b193883ac1cfb90618"

export const fetchWeather = async (query, units = "metric") => {
  const { data } = await axios.get(SEARCHURL, {
    params: { q: query, units, appid: API_KEY },
  })
  return data
}

export const fetchCurrentWeather = async ({ lat, lon, cache = true, units = "metric" }) => {
  const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

  if (cache) {
    const cached = DataService.getCachedData()
    if (cached && cached.expiry > new Date().getTime()) {
      return cached.data
    }
  }

  try {
    // Fetch current weather
    const currentResponse = await axios.get(CURRENT_WEATHER_URL, {
      params: {
        lat,
        lon,
        units,
        appid: API_KEY,
      },
    })

    // Fetch 5-day forecast for hourly and daily data
    const forecastResponse = await axios.get(FORECAST_URL, {
      params: {
        lat,
        lon,
        units,
        appid: API_KEY,
      },
    })

    const currentData = currentResponse.data
    const forecastData = forecastResponse.data

    // Transform the data to match the expected format
    const transformedData = {
      current: {
        dt: currentData.dt,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        temp: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        pressure: currentData.main.pressure,
        humidity: currentData.main.humidity,
        clouds: currentData.clouds.all,
        visibility: currentData.visibility,
        wind_speed: currentData.wind.speed,
        wind_deg: currentData.wind.deg,
        weather: currentData.weather,
        rain: currentData.rain || null,
      },
      hourly: forecastData.list.slice(0, 48).map((item) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        clouds: item.clouds.all,
        visibility: item.visibility || 10000,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        weather: item.weather,
        pop: item.pop,
        rain: item.rain || null,
      })),
      daily: [],
    }

    // Create daily data from forecast (group by day)
    const dailyMap = new Map()
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          dt: item.dt,
          sunrise: currentData.sys.sunrise,
          sunset: currentData.sys.sunset,
          temp: {
            min: item.main.temp,
            max: item.main.temp,
          },
          humidity: item.main.humidity,
          weather: item.weather,
          pop: item.pop,
          temps: [item.main.temp],
        })
      } else {
        const day = dailyMap.get(date)
        day.temp.min = Math.min(day.temp.min, item.main.temp)
        day.temp.max = Math.max(day.temp.max, item.main.temp)
        day.temps.push(item.main.temp)
      }
    })

    transformedData.daily = Array.from(dailyMap.values())
      .slice(0, 7)
      .map((day) => ({
        ...day,
        temp: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
        },
      }))

    if (cache) {
      DataService.storeDataInCache(transformedData)
    }

    return transformedData
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message)
    throw new Error(`Weather API Error: ${error.response?.data?.message || error.message}`)
  }
}
