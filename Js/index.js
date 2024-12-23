const API_KEY = "f7ce5fb574b84217bc4145951242112";

// City to query mappings
const cityQueries = {
    Alexandria: "Alexandria",
    Cairo: "Cairo",
    AlMahalla: "Tanta",
    Luxor: "Luxor",
    General: "New York",
};

const cityDropdown = document.getElementById("cityDropdown");
const body = document.body;

// Fetch weather data
const fetchWeatherData = async (city) => {
    const query = cityQueries[city];
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=4&aqi=no&alerts=no`;

    try {
        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        updateRealTimeWeather(weatherData);
        populateCarousel(weatherData);
        updateFutureWeather(weatherData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

// Update real-time weather
const updateRealTimeWeather = (data) => {
    const currentWeather = data.current;
    document.querySelector(".col-3").innerHTML = `
        <h1>${data.location.name}</h1>
        <h3>${new Date(data.location.localtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</h3>
        <h3>${currentWeather.temp_c}°C</h3>
        <p>${currentWeather.condition.text}</p>
        <p>Wind: ${currentWeather.wind_kph} kph</p>
        <p>Humidity: ${currentWeather.humidity}%</p>
    `;
};

// Populate carousel with hourly weather
const populateCarousel = (data) => {
    const carouselContainer = document.querySelector(".logos-slide");
    carouselContainer.innerHTML = ""; // Clear any existing slides

    const hourlyData = data.forecast.forecastday[0].hour; // Get hourly data

    // Duplicate data for seamless looping
    const extendedData = [
        ...hourlyData.slice(-3), // Last 3 hours appended to the beginning
        ...hourlyData,          // Original data
        ...hourlyData.slice(0, 3) // First 3 hours appended to the end
    ];

    extendedData.forEach((hour, index) => {
        const time = new Date(hour.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const weatherItem = document.createElement("div");
        weatherItem.classList.add("weather-item");

        weatherItem.innerHTML = `
            <h3>${time}</h3>
            <i class="fa-solid ${getWeatherIcon(hour.condition.text)} fa-3x mb-2"></i>
            <h4 class="text-wrap">${hour.condition.text}</h4>
            <p>Temperature: ${hour.temp_c}°C</p>
            <p>Humidity: ${hour.humidity}%</p>
            <p>Chance of Rain: ${hour.chance_of_rain}%</p>
        `;

        carouselContainer.appendChild(weatherItem);
    });
};


// Update future weather for 3 days
const updateFutureWeather = (data) => {
    const futureDays = data.forecast.forecastday;

    console.log("Forecast Days:", futureDays); // Debugging: Log API response

    // Iterate over the next 3 days (starting from tomorrow)
    for (let i = 0; i < 3; i++) {
        const futureDay = futureDays[i + 1]; // Skip today's data (index 0)
        const dateElement = document.getElementById(`date${i + 1}`);
        const tempElement = document.getElementById(`temp${i + 1}`);
        const conditionsElement = document.getElementById(`conditions${i + 1}`);

        if (futureDay) {
            // Populate the card with forecast data
            dateElement.textContent = new Date(futureDay.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });

            tempElement.innerHTML = `
                <i class="fa-solid ${getWeatherIcon(futureDay.day.condition.text)} weather-icon"></i>
                <span class="temperature">${futureDay.day.avgtemp_c}°C</span>
            `;

            conditionsElement.innerHTML = `
                <p>${futureDay.day.condition.text}</p>
                <p>Wind: ${futureDay.day.maxwind_kph} kph</p>
                <p>Humidity: ${futureDay.day.avghumidity}%</p>
            `;
        } else {
            // If no data is available, display a placeholder
            dateElement.textContent = "No Data";
            tempElement.innerHTML = `<span class="temperature">--°C</span>`;
            conditionsElement.innerHTML = `<p>No weather data available</p>`;
        }
    }
};


// Map weather conditions to icons
const getWeatherIcon = (condition) => {
    if (condition.includes("Sunny") || condition.includes("Clear")) return "fa-sun";
    if (condition.includes("Cloudy")) return "fa-cloud";
    if (condition.includes("Rain")) return "fa-cloud-showers-heavy";
    if (condition.includes("Snow")) return "fa-snowflake";
    if (condition.includes("Thunder")) return "fa-bolt";
    return "fa-smog";
};

// Handle dropdown selection
cityDropdown.addEventListener("change", () => {
    const city = cityDropdown.value;

    // Save selected city to local storage
    localStorage.setItem("selectedCity", city);

    // Update theme and fetch data
    body.className = `theme-${city.toLowerCase()}`;
    fetchWeatherData(city);
});

// Initialize default settings or load from local storage
const initializeApp = () => {
    const savedCity = localStorage.getItem("selectedCity") || "Alexandria";
    cityDropdown.value = savedCity;
    body.className = `theme-${savedCity.toLowerCase()}`;
    fetchWeatherData(savedCity);
};

initializeApp();
