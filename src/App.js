import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import moment from "moment-timezone";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
<style>
  @import
  url('https://fonts.googleapis.com/css2?family=Abyssinica+SIL&family=Amatic+SC:wght@400;700&family=Bebas+Neue&family=Jost:ital,wght@0,100..900;1,100..900&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
</style>;

// Main component=================================
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("sydney"); // State to track the city being searched
  const apiKey = "ae886646ae881e6c769ec0b0090f3c85";
  const [videoSrc, setVideoSrc] = useState("");

  // UseEffect to fetch weather data when the city changes
  // useEffect(() => {
  //   if (city) {
  //     const fetchWeather = async () => {
  //       try {
  //         const response = await axios.get(
  //           `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  //         );
  //         setWeatherData(response.data);
  //       } catch (error) {
  //         console.error("Error fetching weather data:", error);
  //       }
  //     };
  //     fetchWeather();
  //   }
  // }, [city]);
  // console.log(weatherData);

  // Fetch weather and set video source based on weather
  const fetchWeather = async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // 1. Fetch weather data only when the city changes
  useEffect(() => {
    if (city) fetchWeather(city);
  }, [city]);

  // 2. Update videoSrc based on updated weatherData
  useEffect(() => {
    if (weatherData) {
      const isNightTime = isNight(weatherData);
      const mainWeather = weatherData.weather[0].main.toLowerCase();
      const newVideoSrc = getWeatherVideo(mainWeather, isNightTime);
      setVideoSrc(newVideoSrc);
      console.log(`Updated video source: ${newVideoSrc}`);
    }
  }, [weatherData]);

  const handleSearch = (newCity) => setCity(newCity);

  return (
    <>
      <div className="app-container">
        {/* Single Video Element for Both Header and Weather */}
        {videoSrc && (
          <video
            key={videoSrc}
            className="background-video"
            autoPlay
            loop
            muted
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        <Header onSearch={handleSearch} />
        {weatherData ? (
          <>
            <GetWeather
              key={weatherData.id}
              weatherData={weatherData}
              videoSrc={videoSrc}
            />
          </>
        ) : (
          <p>Please enter a city to see the weather information.</p>
        )}
      </div>
      {weatherData ? (
        <>
          <WeatherDisplay weatherData={weatherData} apiKey={apiKey} />
          <br />
          <MapComponent key={weatherData.id} weatherData={weatherData} />
        </>
      ) : (
        <p>Please enter a city to see the weather information.</p>
      )}
    </>
  );
}

export default App;

// NAVBAR HEADER!!!!!!!!!!===================

function Header({ onSearch, videoSrc }) {
  return (
    <nav className="navbar navbar-expand-lg ">
      <div className="container navbar-content">
        <div className="d-flex align-items-center">
          <img src="/logo.png" alt="rainy" style={{ maxWidth: "60px" }} />
          <a
            style={{ fontSize: "20px" }}
            href="##"
            className="navbar-brand text-light ms-3"
          >
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
          <ul className="navbar-nav w-100 d-flex flex-md-row flex-column gap-2 align-items-center ">
            <li className="nav-item flex-grow-1">
              <SearchBar onSearch={onSearch} />
            </li>
            <li className="nav-item">
              <a href="##" className="btn btn-dark mx-2">
                About us
              </a>
            </li>
            <li className="nav-item">
              <a href="##" className="btn btn-dark mx-2">
                Weather Help
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

//=====================================================
//SEARCHBAR
function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    if (inputValue) {
      onSearch(inputValue);
      setInputValue(""); // Clear input after search
    }
  };

  return (
    <div className="d-flex align-items-center w-100">
      <input
        className=" flex-grow-1 mx-1 search-box"
        type="text"
        placeholder="Enter city name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button className="search-btn" onClick={handleSearch}>
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
}
//NAVBAR END !!!!!!!!
//==================================================================
//GETWEATHER

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
  console.log(
    `Local Time: ${localTime.format("HH:mm")}, Sunrise: ${sunriseTime.format(
      "HH:mm"
    )}, Sunset: ${sunsetTime.format("HH:mm")}`
  );
  return localTime.isAfter(sunsetTime) || localTime.isBefore(sunriseTime);
}

// Helper function to determine video based on weather and time of day
function getWeatherVideo(mainWeather, isNightTime) {
  console.log(mainWeather);
  if (isNightTime) {
    switch (mainWeather) {
      case "clear":
        return "/clear.mp4";
      case "rain":
      case "Light Rain":
      case "Moderate Rain":
      case "Heavy Intensity Rain":
      case "Very Heavy Rain":
      case "Extreme Rain":
      case "Freezing Rain":
      case " Light Intensity Shower Rain":
      case "Shower Rain":
      case "Heavy Intensity Shower Rain":
      case "Ragged Shower Rain":
        return "/rain_night.mp4";
      case "snow":
      case "Heavy Snow":
      case "Sleet":
      case "Light Shower Sleet":
      case "Shower Sleet":
      case "Light Rain and Snow":
      case "Rain and Snow":
      case "Light Shower Snow":
      case "Shower Snow":
      case "Heavy Shower Snow":
        return "/snow_night.mp4";
      case "clouds":
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
      case "overcast clouds":
        return "/clear.mp4";
      default:
        return "/clear.mp4";
    }
  } else {
    switch (mainWeather) {
      case "clear":
        return "/day_clouds.mp4";
      case "rain":
      case "Light Rain":
      case "Moderate Rain":
      case "Heavy Intensity Rain":
      case "Very Heavy Rain":
      case "Extreme Rain":
      case "Freezing Rain":
      case " Light Intensity Shower Rain":
      case "Shower Rain":
      case "Heavy Intensity Shower Rain":
      case "Ragged Shower Rain":
        return "/day_rain.mp4";
      case "Snow":
      case "Heavy Snow":
      case "Sleet":
      case "Light Shower Sleet":
      case "Shower Sleet":
      case "Light Rain and Snow":
      case "Rain and Snow":
      case "Light Shower Snow":
      case "Shower Snow":
      case "Heavy Shower Snow":
        return "/snow.mp4";
      case "clouds":
      case "few clouds":
      case "scattered clouds":
      case "	broken clouds":
      case "	overcast clouds":
        return "/day_clouds.mp4";
      default:
        return "/day_clouds.mp4";
    }
  }
}

function GetWeather({ weatherData, videoSrc }) {
  // useEffect(() => {
  //   if (weatherData) {
  //     // Reset videoSrc initially to ensure it changes with new data
  //     // const isNightTime = isNight(weatherData);
  //     // const mainWeather = weatherData.weather[0].main.toLowerCase();
  //     // const newVideoSrc = getWeatherVideo(mainWeather, isNightTime);
  //     // console.log(
  //     //   `Setting video source to: ${videoSrc} for weather: ${mainWeather}, isNightTime: ${isNightTime}`
  //     // );
  //     // Update video source after reset
  //     // setVideoSrc(newVideoSrc);
  //   }
  // }, [weatherData]); // Depend on weatherData to ensure video updates

  return (
    <div className="weather-container">
      {/* Weather information display */}
      <div className="text-center text-white">
        {weatherData ? (
          <div className="d-flex align-items-center">
            <p className="display-1 bold">
              {parseInt(weatherData.main.temp, 10)}°
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
              alt="weather_icon"
            />
          </div>
        ) : (
          <p>Please search for a city to see the weather data.</p>
        )}
      </div>
    </div>
  );
}

// Helper functions for date and time formatting
function getCurrentDate() {
  const today = new Date();
  const options = { weekday: "long", month: "long", day: "numeric" };
  return today.toLocaleDateString("en-US", options);
}

function getLocalTime(timezoneOffset) {
  const localTime = moment.utc().add(timezoneOffset, "seconds");
  return localTime.format("HH:mm");
}

//===================================================================
const MapComponent = ({ weatherData }) => {
  const position = [weatherData.coord.lat, weatherData.coord.lon];

  // Custom hook to reset the map center when position changes
  const MapRef = () => {
    const map = useMap();
    useEffect(() => {
      map.setView(position, 13); // Update the view to new position with default zoom level
    }, [position, map]);
    return null;
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      key={weatherData.id} // Ensure the map fully re-renders on new search
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
        <Popup>Coordinates: {position}</Popup>
      </Marker>
      <MapRef />
    </MapContainer>
  );
};

//=============================================
function WeatherDisplay({ weatherData, apiKey, videoSrc }) {
  return weatherData ? (
    <>
      <div>
        <br />
        <br />
        <WeatherForecast city={weatherData.name} apikey={apiKey} />
      </div>
    </>
  ) : null;
}

// Updated WeatherForecast Component for 5-day/3-hour forecast
function WeatherForecast({ city, apikey }) {
  const [forecastData, setForecastData] = useState({});
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // Track the currently displayed day

  useEffect(() => {
    if (city) {
      const fetchWeatherForecast = async () => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apikey}&units=metric`
          );
          const groupedData = groupByDay(response.data.list);
          console.log(groupedData); // Group the forecast by day
          setForecastData(groupedData);
        } catch (error) {
          console.error("Error fetching forecast data:", error);
        }
      };

      fetchWeatherForecast();
    }
  }, [city, apikey]);

  // Function to group forecast data by day
  const groupByDay = (data) => {
    return data.reduce((acc, forecast) => {
      const date = moment(forecast.dt * 1000).format("YYYY-MM-DD"); // Group by the date
      if (!acc[date]) {
        acc[date] = []; // Initialize an array for each new date
      }
      acc[date].push(forecast); // Add the forecast to the corresponding date
      return acc;
    }, {});
  };

  // Handle navigation between days
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

  // Get the keys (dates) to use for indexing
  const days = Object.keys(forecastData);

  return (
    <div className="weather-forecast">
      {days.length > 0 ? (
        <>
          <div className="day-navigation">
            <button
              onClick={handlePreviousDay}
              disabled={currentDayIndex === 0}
              className="button-forecast me-2 display-6"
            >
              &lt;
            </button>
            <span className="display-6">
              {moment(days[currentDayIndex]).format("dddd, MMMM Do")}
            </span>
            <button
              onClick={handleNextDay}
              disabled={currentDayIndex === days.length - 1}
              className="button-forecast ms-2 display-6"
            >
              &gt;
            </button>
          </div>

          <div className="forecast-div d-flex justify-content-center overflow-auto small">
            {forecastData[days[currentDayIndex]].map((forecast, idx) => (
              <div key={idx} className="forecast-item text-center p-5">
                <p className="display-6">
                  {moment(forecast.dt * 1000).format("HH:mm")}
                </p>

                <img
                  src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                  alt="weather_icon"
                />
                <p>{forecast.main.temp}°C</p>
                <p>{forecast.weather[0].description}</p>
                <p>Humidity: {forecast.main.humidity}%</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading forecast data...</p>
      )}
    </div>
  );
}
