import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import "./App.css";

// Main App Component
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("sydney");
  const [error, setError] = useState(null);
  const [backgroundVideoSrc, setBackgroundVideoSrc] = useState("");
  const [weatherVideoSrc, setWeatherVideoSrc] = useState("");
  const apiKey = "ae886646ae881e6c769ec0b0090f3c85";

  // Fetch weather data
  useEffect(() => {
    if (city) {
      const fetchWeather = async () => {
        try {
          setError(null);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
          );
          setWeatherData(response.data);
        } catch (error) {
          console.error("Error fetching weather data:", error);
          setError("City not found. Please try again.");
          setWeatherData(null);
        }
      };
      fetchWeather();
    }
  }, [city]);

  // Update video sources
  useEffect(() => {
    if (weatherData) {
      const isNightTime = isNight(weatherData);
      const mainWeather = weatherData.weather[0].main.toLowerCase();
      const newBackgroundVideoSrc = getWeatherVideo(mainWeather, isNightTime);
      const newWeatherVideoSrc = getWeatherVideo(mainWeather, isNightTime);
      setBackgroundVideoSrc(newBackgroundVideoSrc);
      setWeatherVideoSrc(newWeatherVideoSrc);
    }
  }, [weatherData]);

  const handleSearch = (newCity) => {
    if (newCity.trim()) setCity(newCity.trim());
  };

  return (
    <div className="app-container">
      {backgroundVideoSrc && (
        <video
          key={backgroundVideoSrc}
          className="background-video animate__animated animate__fadeIn"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={backgroundVideoSrc} type="video/mp4" />
        </video>
      )}
      <Header onSearch={handleSearch} />
      {error && <p className="text-center text-danger">{error}</p>}
      {weatherData ? (
        <>
          <GetWeather
            weatherData={weatherData}
            weatherVideoSrc={weatherVideoSrc}
          />
          <WeatherDisplay weatherData={weatherData} apiKey={apiKey} />
          <MapComponent weatherData={weatherData} />
        </>
      ) : (
        <p className="text-center text-white">
          {error || "Enter a city to view weather information."}
        </p>
      )}
    </div>
  );
}

// Header Component
function Header({ onSearch }) {
  return (
    <nav className="navbar navbar-expand-lg header-nav">
      <div className="container navbar-content">
        <div className="d-flex align-items-center">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Weather Logo"
            className="logo-img"
          />
          <a href="#" className="navbar-brand text-light ms-2">
            MyWeatherApp
          </a>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav w-100 d-flex flex-md-row flex-column gap-2 align-items-md-center">
            <li className="nav-item flex-grow-1">
              <SearchBar onSearch={onSearch} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

// SearchBar Component
function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    if (inputValue) {
      onSearch(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="d-flex align-items-center w-100">
      <input
        className="flex-grow-1 mx-1 search-box"
        type="text"
        placeholder="Enter city name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="search-btn" onClick={handleSearch}>
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
}

// GetWeather Component
function GetWeather({ weatherData, weatherVideoSrc }) {
  return (
    <div className="weather-container">
      {weatherVideoSrc && (
        <video
          key={weatherVideoSrc}
          className="weather-video animate__animated animate__fadeIn"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={weatherVideoSrc} type="video/mp4" />
        </video>
      )}
      <div className="weather-info text-center text-white animate__animated animate__fadeIn">
        <div className="d-flex align-items-center justify-content-center flex-wrap">
          <p className="display-1 fw-bold">
            {parseInt(weatherData.main.temp, 10)}°C
          </p>
          <div className="d-flex flex-column mx-3 align-self-center">
            <p className="display-6 mb-1">{weatherData.name}</p>
            <p className="date-time">
              {getLocalTime(weatherData.timezone)} - {getCurrentDate()}
            </p>
          </div>
          <img
            className="icon-size"
            src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt="Weather Icon"
          />
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function getCurrentDate() {
  return moment().format("dddd, MMMM Do");
}

function getLocalTime(timezoneOffset) {
  return moment.utc().add(timezoneOffset, "seconds").format("HH:mm");
}

function isNight(weatherData) {
  const { sunset, sunrise } = weatherData.sys;
  const localTime = moment.utc().add(weatherData.timezone, "seconds");
  const sunsetTime = moment
    .unix(sunset)
    .utc()
    .add(weatherData.timezone, "seconds");
  const sunriseTime = moment
    .unix(sunrise)
    .utc()
    .add(weatherData.timezone, "seconds");
  return localTime.isAfter(sunsetTime) || localTime.isBefore(sunriseTime);
}

function getWeatherVideo(mainWeather, isNightTime) {
  if (isNightTime) {
    switch (mainWeather) {
      case "clear":
        return `${process.env.PUBLIC_URL}/clear.mp4`;
      case "rain":
      case "light rain":
      case "moderate rain":
      case "heavy intensity rain":
      case "very heavy rain":
      case "extreme rain":
      case "freezing rain":
      case "light intensity shower rain":
      case "shower rain":
      case "heavy intensity shower rain":
      case "ragged shower rain":
        return `${process.env.PUBLIC_URL}/rain_night.mp4`;
      case "snow":
      case "heavy snow":
      case "sleet":
      case "light shower sleet":
      case "shower sleet":
      case "light rain and snow":
      case "rain and snow":
      case "light shower snow":
      case "shower snow":
      case "heavy shower snow":
        return `${process.env.PUBLIC_URL}/snow_night.mp4`;
      case "clouds":
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
      case "overcast clouds":
        return `${process.env.PUBLIC_URL}/clear.mp4`;
      default:
        return `${process.env.PUBLIC_URL}/clear.mp4`;
    }
  } else {
    switch (mainWeather) {
      case "clear":
        return `${process.env.PUBLIC_URL}/day_clouds.mp4`;
      case "rain":
      case "light rain":
      case "moderate rain":
      case "heavy intensity rain":
      case "very heavy rain":
      case "extreme rain":
      case "freezing rain":
      case "light intensity shower rain":
      case "shower rain":
      case "heavy intensity shower rain":
      case "ragged shower rain":
        return `${process.env.PUBLIC_URL}/day_rain.mp4`;
      case "snow":
      case "heavy snow":
      case "sleet":
      case "light shower sleet":
      case "shower sleet":
      case "light rain and snow":
      case "rain and snow":
      case "light shower snow":
      case "shower snow":
      case "heavy shower snow":
        return `${process.env.PUBLIC_URL}/snow.mp4`;
      case "clouds":
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
      case "overcast clouds":
        return `${process.env.PUBLIC_URL}/day_clouds.mp4`;
      default:
        return `${process.env.PUBLIC_URL}/day_clouds.mp4`;
    }
  }
}

// Map Component
function MapComponent({ weatherData }) {
  const position = [weatherData.coord.lat, weatherData.coord.lon];

  const MapRef = () => {
    const map = useMap();
    useEffect(() => {
      map.setView(position, 13);
    }, [position, map]);
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "300px", width: "100%", borderRadius: "15px" }}
      key={weatherData.id}
      className="map-container"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={position}
        icon={L.icon({
          iconUrl: markerIconPng,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      >
        <Popup>Coordinates: {position.join(", ")}</Popup>
      </Marker>
      <MapRef />
    </MapContainer>
  );
}

// WeatherDisplay Component
function WeatherDisplay({ weatherData, apiKey }) {
  return (
    <div className="weather-display">
      <WeatherForecast city={weatherData.name} apikey={apiKey} />
    </div>
  );
}

// WeatherForecast Component
function WeatherForecast({ city, apikey }) {
  const [forecastData, setForecastData] = useState({});
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    if (city) {
      const fetchWeatherForecast = async () => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`
          );
          const groupedData = groupByDay(response.data.list);
          setForecastData(groupedData);
        } catch (error) {
          console.error("Error fetching forecast data:", error);
        }
      };
      fetchWeatherForecast();
    }
  }, [city, apikey]);

  const groupByDay = (data) => {
    return data.reduce((acc, forecast) => {
      const date = moment(forecast.dt * 1000).format("YYYY-MM-DD");
      if (!acc[date]) acc[date] = [];
      acc[date].push(forecast);
      return acc;
    }, {});
  };

  const handleNextDay = () => {
    if (currentDayIndex < Object.keys(forecastData).length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handlePreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const days = Object.keys(forecastData);

  return (
    <div className="weather-forecast animate__animated animate__fadeIn">
      {days.length > 0 ? (
        <>
          <div className="day-navigation">
            <button
              onClick={handlePreviousDay}
              disabled={currentDayIndex === 0}
              className="button-forecast"
            >
              &lt;
            </button>
            <span className="display-6">
              {moment(days[currentDayIndex]).format("dddd, MMMM Do")}
            </span>
            <button
              onClick={handleNextDay}
              disabled={currentDayIndex === days.length - 1}
              className="button-forecast"
            >
              &gt;
            </button>
          </div>
          <div className="forecast-div d-flex flex-wrap justify-content-center gap-2">
            {forecastData[days[currentDayIndex]].map((forecast, idx) => (
              <div key={idx} className="forecast-item text-center">
                <p className="mb-2">
                  {moment(forecast.dt * 1000).format("HH:mm")}
                </p>
                <img
                  src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                  alt="Weather Icon"
                  className="mb-2"
                />
                <p className="mb-1">{forecast.main.temp}°C</p>
                <p className="mb-1 text-capitalize">
                  {forecast.weather[0].description}
                </p>
                <p>Humidity: {forecast.main.humidity}%</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-white">Loading forecast data...</p>
      )}
    </div>
  );
}

export default App;
