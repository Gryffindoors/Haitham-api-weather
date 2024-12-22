// Clone the .logos-slide element for the carousel
const logosSlide = document.querySelector(".logos-slide");

if (logosSlide) {
    const cloneEl = logosSlide.cloneNode(true);
    document.querySelector(".logos").appendChild(cloneEl);
} else {
    console.error("The .logos-slide element was not found. Please ensure it exists in your HTML.");
}

// Weather API Key
const API_KEY = "f7ce5fb574b84217bc4145951242112";

// Mapping cities to API query values
const cityQueries = {
    General: "New York", // Default general city for fetching data
    Alexandria: "Alexandria",
    Cairo: "Cairo",
    AlMahalla: "Tanta", // Weather API does not recognize Al-Mahalla; using Tanta
    Luxor: "Luxor",
};

// Function to Fetch Weather Data
const fetchWeatherData = async (city) => {
    const query = cityQueries[city];
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=3&aqi=no&alerts=no`;

    try {
        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        // Update real-time weather and carousel
        updateRealTimeWeather(weatherData);

        // Update hourly carousel
        populateCarousel(weatherData);

        // Update future weather for next three days
        updateFutureWeather(weatherData);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

// Update Real-Time Weather in the .col-3 Section
const updateRealTimeWeather = (data) => {
    const currentWeather = data.current;
    const col3Container = document.querySelector(".col-3");

    if (col3Container) {
        col3Container.innerHTML = `
            <h1>${data.location.name}</h1>
            <h3>${new Date(data.location.localtime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })}</h3>
            <h3>${currentWeather.temp_c}°C</h3>
            <p>Condition: ${currentWeather.condition.text}</p>
            <p>Wind: ${currentWeather.wind_kph} kph</p>
            <p>Humidity: ${currentWeather.humidity}%</p>
        `;
    }
};

// Populate the Carousel with Hourly Weather Data
const populateCarousel = (data) => {
    const carouselContainer = document.querySelector(".logos-slide");
    carouselContainer.innerHTML = ""; // Clear any existing slides

    const hourlyData = data.forecast.forecastday[0].hour; // Get hourly data

    hourlyData.forEach((hour) => {
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

// Update Future Weather Data for Next Three Days
const updateFutureWeather = (data) => {
    const futureDays = data.forecast.forecastday;

    for (let i = 1; i <= 3; i++) {
        const futureDay = futureDays[i - 1];
        if (futureDay) {
            const dateElement = document.getElementById(`date${i}`);
            const tempElement = document.getElementById(`temp${i}`);
            const conditionsElement = document.getElementById(`conditions${i}`);

            dateElement.textContent = new Date(futureDay.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });

            tempElement.innerHTML = `
                <span class="temperature">${futureDay.day.avgtemp_c}°C</span>
                <i class="fa-solid ${getWeatherIcon(futureDay.day.condition.text)} weather-icon"></i>
            `;

            conditionsElement.innerHTML = `
                ${futureDay.day.condition.text}<br>
                Wind: ${futureDay.day.maxwind_kph} kph<br>
                Humidity: ${futureDay.day.avghumidity}%
            `;
        }
    }
};

// Helper Function to Map Weather Conditions to Font Awesome Icons
const getWeatherIcon = (condition) => {
    if (condition.includes("Sunny") || condition.includes("Clear")) {
        return "fa-sun";
    } else if (condition.includes("Cloudy")) {
        return "fa-cloud";
    } else if (condition.includes("Rain")) {
        return "fa-cloud-showers-heavy";
    } else if (condition.includes("Snow")) {
        return "fa-snowflake";
    } else if (condition.includes("Thunder")) {
        return "fa-bolt";
    } else {
        return "fa-smog"; // Default for foggy/misty conditions
    }
};

// Dropdown Logic to Change City, Theme, and Fetch Weather Data
const dropdownItems = document.querySelectorAll(".dropdown-item");
const body = document.body;
const cityNameElement = document.getElementById("cityName");
const currentDateElement = document.getElementById("currentDate");

dropdownItems.forEach((item) => {
    item.addEventListener("click", function () {
        const city = item.getAttribute("data-id");

        // Change the theme by updating the body class
        body.classList.remove(
            "theme-general",
            "theme-alexandria",
            "theme-cairo",
            "theme-almahalla",
            "theme-luxor"
        );

        // Update theme and city name
        if (city === "Alexandria") {
            body.classList.add("theme-alexandria");
        } else if (city === "Cairo") {
            body.classList.add("theme-cairo");
        } else if (city === "AlMahalla") {
            body.classList.add("theme-almahalla");
        } else if (city === "Luxor") {
            body.classList.add("theme-luxor");
        } else {
            body.classList.add("theme-general");
        }

        // Update City Name in Header
        cityNameElement.textContent = city === "AlMahalla" ? "Al-Mahalla" : city;

        // Fetch Weather Data for the Selected City
        fetchWeatherData(city);

        // Update Current Date
        updateDate();
    });
});

// Function to Update the Current Date
const updateDate = () => {
    const currentDate = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    currentDateElement.textContent = currentDate;
};

// Default Theme and Weather Fetch on Startup
body.classList.add("theme-general");
cityNameElement.textContent = "General";
updateDate();
fetchWeatherData("General");

// Auto-Update Date Every Minute
setInterval(updateDate, 60000);
