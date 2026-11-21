let themeToggle = document.getElementById("theme-toggle");
let buttonSearch = document.querySelector(".search-button");
let inputSearch = document.querySelector(".search-box input");
let errorMessage = document.querySelector(".error-message");

let unitButtons = document.querySelectorAll(".units button");
let hourButton = document.querySelector(".hours-button");
let daysList = document.querySelector(".days-list");

let selectedUnit = "C";
let weatherData = null;
let selectedDayIndex = 0;

let savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.dataset.theme = savedTheme;

themeToggle.innerHTML = savedTheme === "dark"
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';


themeToggle.onclick = function () {

    if (document.documentElement.dataset.theme === "dark") {

        document.documentElement.dataset.theme = "light";
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';

    } else {

        document.documentElement.dataset.theme = "dark";
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';

    }

    // Save Theme
    localStorage.setItem("theme", document.documentElement.dataset.theme);

};




buttonSearch.onclick = function () {

    let city = inputSearch.value.trim();

    if (city === "") {

        errorMessage.textContent = "Please enter a city name";

    } else {

        errorMessage.textContent = "";

        let apiKey = "38e0733b4dc54647b6493850262111";

        let url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {

                if (data.location) {

                    weatherData = data;
                    selectedDayIndex = 0;

                    // Select Weather Elements
                    let cityName = document.querySelector(".city-name");
                    let countryName = document.querySelector(".country-name");
                    let currentDate = document.querySelector(".current-date");

                    let humiditySpan = document.querySelector(".weather-highlights .humidity span");
                    let windSpan = document.querySelector(".weather-highlights .wind span");
                    let precipitationSpan = document.querySelector(".weather-highlights .precipitation span");

                    // Display Location Information
                    let dateNow = new Date(data.location.localtime);

                    cityName.innerHTML = data.location.name + ",";
                    countryName.innerHTML = data.location.country;

                    currentDate.innerHTML = dateNow.toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });

                    // Display Weather Information
                    updateCurrentTemperature();

                    humiditySpan.innerHTML = Math.round(data.current.humidity) + `%`;
                    windSpan.innerHTML = Math.round(data.current.wind_kph) + ` km/h`;
                    precipitationSpan.innerHTML = Math.round(data.current.precip_mm) + ` mm`;

                    // Display Forecast
                    displayDailyForecast(data);
                    displayDays(data);
                    toggleDaysList();

                } else {

                    errorMessage.textContent = data.error?.message || "City not found!";

                }

            })
            .catch((error) => {

                console.log(error);
                errorMessage.textContent = "Something went wrong!";

            });

    }

};


// ==========================================
// 5. Display Daily Forecast
// ==========================================

function displayDailyForecast(data) {

    let dailyDiv = document.querySelectorAll(".daily-item .day");

    for (let i = 0; i < data.forecast.forecastday.length; i++) {

        let day = data.forecast.forecastday[i];

        let date = new Date(day.date);

        let dayName = date.toLocaleDateString("en-US", {
            weekday: "long"
        });

        dayName = dayName.slice(0, 3);

        // Day Name
        let dailySpanName = document.createElement("span");
        dailySpanName.innerHTML = dayName;

        // Weather Icon
        let imgDaily = document.createElement("img");

        imgDaily.setAttribute("src", "https:" + day.day.condition.icon);
        imgDaily.setAttribute("alt", day.day.condition.text);
        imgDaily.setAttribute("title", day.day.condition.text);

        // Temperatures
        let maxTemp = selectedUnit === "C"
            ? day.day.maxtemp_c
            : day.day.maxtemp_f;

        let minTemp = selectedUnit === "C"
            ? day.day.mintemp_c
            : day.day.mintemp_f;

        let dailySpanNumber = document.createElement("span");

        dailySpanNumber.textContent = `${Math.round(maxTemp)}°  ${Math.round(minTemp)}°`;

        // Add Elements
        dailyDiv[i].innerHTML = "";

        dailyDiv[i].appendChild(dailySpanName);
        dailyDiv[i].appendChild(imgDaily);
        dailyDiv[i].appendChild(dailySpanNumber);

    }

}


// ==========================================
// 6. Display Hourly Forecast
// ==========================================

function displayhourlyForecast(data, dayIndex) {

    let hourlyItem = document.querySelector(".hourly-item");

    let hours = data.forecast.forecastday[dayIndex].hour;

    hourlyItem.innerHTML = "";

    for (let i = 0; i < hours.length; i++) {

        let hourTime = new Date(hours[i].time);

        let hourDiv = document.createElement("div");

        // Hour Name
        let hourName = document.createElement("span");

        hourName.textContent = hourTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });

        // Hour Temperature
        let temperature = selectedUnit === "C"
            ? hours[i].temp_c
            : hours[i].temp_f;

        let hourTemp = document.createElement("span");

        hourTemp.textContent = Math.round(temperature) + "°";

        // Add Elements
        hourDiv.appendChild(hourName);
        hourDiv.appendChild(hourTemp);

        hourlyItem.appendChild(hourDiv);

    }

}


// ==========================================
// 7. Toggle Days Dropdown
// ==========================================

function toggleDaysList() {

    hourButton.onclick = function () {

        daysList.classList.toggle("show");

    };

}


// ==========================================
// 8. Display Days List
// ==========================================

function displayDays(data) {

    let forecastDays = data.forecast.forecastday;

    daysList.innerHTML = "";

    for (let i = 0; i < forecastDays.length; i++) {

        let date = new Date(forecastDays[i].date + "T12:00:00");

        let dayName = date.toLocaleDateString("en-US", {
            weekday: "long"
        });

        let li = document.createElement("li");

        li.textContent = dayName;

        li.onclick = function () {

            hourButton.innerHTML = `
                ${dayName}
                <i class="fa-solid fa-chevron-down"></i>
            `;

            daysList.classList.remove("show");

            selectedDayIndex = i;

            // Display Selected Day Hours
            displayhourlyForecast(data, i);

        };

        daysList.appendChild(li);

    }

    // Select First Day By Default
    let firstDay = new Date(forecastDays[0].date + "T12:00:00");

    hourButton.innerHTML = `
        ${firstDay.toLocaleDateString("en-US", { weekday: "long" })}
        <i class="fa-solid fa-chevron-down"></i>
    `;

    displayhourlyForecast(data, 0);

}


// ==========================================
// 9. Temperature Unit Buttons
// ==========================================

unitButtons.forEach((button) => {

    button.onclick = function () {

        // Remove Active Class
        unitButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        // Add Active Class
        this.classList.add("active");

        // Get Selected Unit
        selectedUnit = this.textContent.trim().replace("°", "");

        // Update Temperatures
        if (weatherData) {

            updateCurrentTemperature();
            displayDailyForecast(weatherData);
            displayhourlyForecast(weatherData, selectedDayIndex);

        }

    };

});


// ==========================================
// 10. Update Current Temperature
// ==========================================

function updateCurrentTemperature() {

    let weatherCondition = document.querySelector(".weather-condition");

    let feelsLikeSpan = document.querySelector(".weather-highlights .fells-like span");

    let currentTemp = selectedUnit === "C"
        ? weatherData.current.temp_c
        : weatherData.current.temp_f;

    let feelsLike = selectedUnit === "C"
        ? weatherData.current.feelslike_c
        : weatherData.current.feelslike_f;

    weatherCondition.textContent = Math.round(currentTemp) + "°";

    feelsLikeSpan.textContent = Math.round(feelsLike) + "°";

}
