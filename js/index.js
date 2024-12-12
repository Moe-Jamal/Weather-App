const cityInput = document.getElementById("input-search");
const searchBtn = document.getElementById("search-icon");
const currentPostionBtn = document.getElementById("locationBtn");
const apiKey = "1dc3a93954dbb91120ddd50c83974538";
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const currentWeatherDiv = document.getElementById("weather-card");
const forecastWeatherDiv = document.getElementById("forecast-container");
const airQulityDiv = document.getElementById("highlights-air");
const sunDetails = document.getElementById("sun-details");
const todayForecast = document.getElementById("hourly-forecast");
const todayWindForecast = document.getElementById("wind-forecast");
const myLoader = document.getElementById("loader");
let forecastChartInstance;
async function getCityCoordinates() {
  myLoader.classList.replace("d-none", "d-flex");
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  try {
    let geoCordinates = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`
    );
    let geoCordinatesData = await geoCordinates.json();
    let { name, lat, lon, country } = geoCordinatesData[0];
    getCurrentWeatherDetails(name, lat, lon, country);
    getWeatherForecast(lat, lon);
    getAirPollutionData(lat, lon);
    getSunRiseSetTime(lat, lon);
    getAirCharacteristics(lat, lon);
    getTodayForcast(lat, lon);
    setTimeout(() => {
      myLoader.classList.replace("d-flex", "d-none");
    }, 1500);
  } catch (error) {
    alert(`Failed To Fetch Coordinates of ${cityName}
      ${error}`);
    myLoader.classList.replace("d-flex", "d-none");
  }
}
async function getUserCoordinates() {
  myLoader.classList.replace("d-none", "d-flex");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;
      let reverseApi = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
      try {
        fetch(reverseApi)
          .then((res) => res.json())
          .then((data) => {
            let { name, country } = data[0];
            getCurrentWeatherDetails(name, latitude, longitude, country);
            getWeatherForecast(latitude, longitude);
            getAirPollutionData(latitude, longitude);
            getSunRiseSetTime(latitude, longitude);
            getAirCharacteristics(latitude, longitude);
            getTodayForcast(latitude, longitude);
            setTimeout(() => {
              myLoader.classList.replace("d-flex", "d-none");
            }, 1500);
          });
      } catch (error) {
        alert(`Failed To get current position
          ${error}`);
        myLoader.classList.replace("d-flex", "d-none");
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          `Geolocation permission denied. Please reset location permission to grant access again`
        );
      }
    }
  );
}
async function getCurrentWeatherDetails(name, lat, lon, country) {
  let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    let weatherDetails = await fetch(weatherApiUrl);
    let currentWeatherData = await weatherDetails.json();
    let date = new Date();
    currentWeatherDiv.innerHTML = `
      <div class="current-weather w-100 d-flex justify-content-between align-items-center">
        <div class="weather-data text-white p-2">
          <span class="fw-semibold fs-5 position-relative text-nowrap">Current Weather</span>
          <h2>
        <span>${(
          Math.round((currentWeatherData.main.temp - 273.15) * 10) / 10
        ).toFixed(1)}&deg;C</span>
          </h2>
          <p class="text-capitalize">${
            currentWeatherData.weather[0].main
          } <br/> ( ${currentWeatherData.weather[0].description} )</p>
        </div>
        <div class="weather-icon">
        <img src="https://openweathermap.org/img/wn/${
          currentWeatherData.weather[0].icon
        }@2x.png" class="w-100" alt="weatherIcon"/>
        </div>
      </div>
      <div class="card-footer text-white p-2">
        <div class="weather-calendar d-flex align-items-center column-gap-3">
          <i class="fa-solid fa-calendar-days"></i>
          <span>${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    }, ${date.getFullYear()}</span>
        </div>
        <div class="weather-location d-flex align-items-center column-gap-3 mt-2">
          <i class="fa-solid fa-location-dot"></i>
          <span>${name} , ${country}</span>
        </div>
      </div>`;
  } catch (error) {
    alert(`Failed To Fetch Current Weather
      ${error}`);
  }
}

async function getWeatherForecast(lat, lon) {
  let forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    let weatherDetails = await fetch(forecastApiUrl);
    let forecastWeatherData = await weatherDetails.json();
    let uniqueForecastDays = [];
    let fiveDaysForecast = forecastWeatherData.list.filter((day) => {
      let forecastDate = new Date(day.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDate)) {
        return uniqueForecastDays.push(forecastDate);
      }
    });
    let myForcastContant = "";
    fiveDaysForecast.forEach((day, index) => {
      if (index !== 0) {
        let date = new Date(day.dt_txt);
        myForcastContant += `
          <div class="forecast-item">
            <div class="img-holder">
                <img src="https://openweathermap.org/img/wn/${
                  day.weather[0].icon
                }.png" alt="${day.weather[0].description}"/>
              </div>
              <div class="min-max d-flex flex-column justify-content-center row-gap-1">
                <p class="mb-0 small text-nowrap">
                  <span class="text-danger me-1">Max</span>${(
                    Math.round((day.main.temp_max - 273.15) * 10) / 10
                  ).toFixed(1)}&deg;C
                </p>
                <p class="mb-0 small text-nowrap">
                  <span class="text-info me-1">Min</span>${(
                    Math.round((day.main.temp_min - 273.15) * 10) / 10
                  ).toFixed(1)}&deg;C
                </p>
              </div>
              <p class="mb-0 small text-nowrap">${date.getDate()} ${
          months[date.getMonth()]
        }</p>
              <p class="mb-0 small">${days[date.getDay()]}</p>
          </div>
          `;
      }
    });
    forecastWeatherDiv.innerHTML = myForcastContant;
  } catch {
    alert(`Failed To Fetch Weather Forecast
      ${error}`);
  }
}

async function getAirPollutionData(lat, lon) {
  const aqiList = [
    "Good",
    "Moderate",
    "Unhealthy FSG",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous",
  ];
  let airPollutionApi = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    let airPollutionDetails = await fetch(airPollutionApi);
    let airPollutionData = await airPollutionDetails.json();
    airQulityDiv.innerHTML = `
      <div class="highlights-title d-flex justify-content-between align-items-center">
        <h5 class="fs-6 opacity-75 me-2">Air Quality Index</h5>
        <span class="api-${
          airPollutionData.list[0].main.aqi
        } fw-bold py-1 px-2 rounded-4">${
      aqiList[airPollutionData.list[0].main.aqi]
    }</span>
      </div>
      <div class="highlights-details d-flex justify-content-between align-items-center mt-4">
        <div class="icon">
          <i class="fa-solid fa-wind fs-1"></i>
        </div>
        <div class="item text-center">
          <span class="opacity-75">PM2.5</span>
          <p class="mb-0">${airPollutionData.list[0].components.pm2_5}</p>
        </div>
        <div class="item text-center">
          <span class="opacity-75">SO2</span>
          <p class="mb-0">${airPollutionData.list[0].components.so2}</p>
        </div>
        <div class="item text-center">
          <span class="opacity-75">NO2</span>
          <p class="mb-0">${airPollutionData.list[0].components.no2}</p>
        </div>
        <div class="item text-center">
          <span class="opacity-75">O3</span>
          <p class="mb-0">${airPollutionData.list[0].components.o3}</p>
        </div>
      </div>
    `;
  } catch {
    alert(`Failed To Fetch Air Pollution Data
      ${error}`);
  }
}

async function getSunRiseSetTime(lat, lon) {
  let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    let weatherDetails = await fetch(weatherApiUrl);
    let currentWeatherData = await weatherDetails.json();
    let { sunrise, sunset } = currentWeatherData.sys,
      { timezone } = currentWeatherData;
    sRiseTime = moment
      .utc(sunrise * 1000)
      .add(timezone, "seconds")
      .format("hh:mm  A");
    sSetTime = moment
      .utc(sunset * 1000)
      .add(timezone, "seconds")
      .format("hh:mm  A");
    sunDetails.innerHTML = `
      <div class="sunrise d-flex justify-content-center align-items-center column-gap-2">
        <div class="icon">
          <i class="fa-regular fa-sun fs-1"></i>
        </div>
        <div class="sunrise-details">
          <span class="opacity-75">Sunrise</span>
          <p class="mb-0 text-nowrap">${sRiseTime}</p>
        </div>
      </div>
      <div class="sunset d-flex justify-content-center align-items-center column-gap-2">
        <div class="icon">
          <i class="fa-solid fa-moon fs-1"></i>
        </div>
        <div class="sunset-details">
          <span class="opacity-75">Sunset</span>
          <p class="mb-0 text-nowrap">${sSetTime}</p>
        </div>
      </div>
    `;
  } catch {
    alert(`Failed To Fetch Sunrise-SunSet Details
      ${error}`);
  }
}

async function getAirCharacteristics(lat, lon) {
  let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const airHumidity = document.getElementById("humidity");
  const airPressure = document.getElementById("pressure");
  const airVisibility = document.getElementById("visibility");
  const airFeelsLike = document.getElementById("feels_like");
  try {
    let weatherDetails = await fetch(weatherApiUrl);
    let currentWeatherData = await weatherDetails.json();
    airHumidity.innerHTML = `${currentWeatherData.main.humidity}%`;
    airPressure.innerHTML = `${currentWeatherData.main.pressure}hpa`;
    airVisibility.innerHTML = `${currentWeatherData.visibility / 1000}Km`;
    airFeelsLike.innerHTML = `${(
      Math.round((currentWeatherData.main.feels_like - 273.15) * 10) / 10
    ).toFixed(1)}&deg;C`;
  } catch {
    alert(`Failed To Fetch Air Characteristics Data
      ${error}`);
  }
}

async function getTodayForcast(lat, lon) {
  let forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    let weatherDetails = await fetch(forecastApiUrl);
    let forecastWeatherData = await weatherDetails.json();
    let hourlyForecast = forecastWeatherData.list;
    let myData = "";
    let myWindData = "";
    const timeIntervals = [];
    const temperatures = [];
    for (let i = 0; i <= 7; i++) {
      let hourlyForecastDate = new Date(hourlyForecast[i].dt_txt);
      let hr = hourlyForecastDate.getHours();
      let a = "PM";
      if (hr < 12) a = "AM";
      if (hr == 0) hr = 12;
      if (hr > 12) hr = hr - 12;
      myData += `
      <li class="slider-item rounded-4 p-2 me-3">
        <div class="slider-card text-center">
          <span>${hr} ${a}</span>
          <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${
              hourlyForecast[i].weather[0].icon
            }.png"
              width="48"
              height="48"
              alt="${hourlyForecast[i].weather[0].description}"/>
          </div>
          <span>${(
            Math.round((hourlyForecast[i].main.temp - 273.15) * 10) / 10
          ).toFixed(1)}&deg;C</span>
        </div>
      </li>
      `;
      // start wind section
      let windSpeed = hourlyForecast[i].wind.speed;
      let windDegree = hourlyForecast[i].wind.deg;
      myWindData += `
        <li class="slider-item rounded-4 p-2 me-3">
          <div class="slider-card text-center">
            <span>${hr} ${a}</span>
            <div class="weather-icon">
              <img src="./images/direction.png"
                width="48"
                height="48"
                alt="Wind-Direction"
                style="transform: rotate(${windDegree}deg);"/>
            </div>
            <span>${(windSpeed * 3.6).toFixed(1)} Km/h</span>
          </div>
        </li>
      `;
      // Start Chart
      temperatures.push(
        (Math.round((hourlyForecast[i].main.temp - 273.15) * 10) / 10).toFixed(
          1
        )
      );
      timeIntervals.push(`${hr} ${a}`);
    }

    todayForecast.innerHTML = myData;
    todayWindForecast.innerHTML = myWindData;
    todayForecastChart(temperatures, timeIntervals);
  } catch (error) {
    alert(`Failed To Fetch Today Forecast
       ${error}`);
  }
}

// Function to Create Chart
function todayForecastChart(temperatures, timeIntervals) {
  const todayTempChart = document
    .getElementById("today-chart")
    .getContext("2d");

  if (forecastChartInstance) {
    forecastChartInstance.destroy();
  }
  forecastChartInstance = new Chart(todayTempChart, {
    type: "line",
    data: {
      labels: timeIntervals, // X-axis labels
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures, // Y-axis data
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          pointStyle: "circle",
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
          },
          beginAtZero: true,
        },
      },
    },
  });
}
searchBtn.addEventListener("click", getCityCoordinates);
currentPostionBtn.addEventListener("click", getUserCoordinates);
document.addEventListener("DOMContentLoaded", getUserCoordinates);
cityInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    getCityCoordinates();
  }
});
