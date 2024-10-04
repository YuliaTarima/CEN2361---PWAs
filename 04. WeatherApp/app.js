// ###############################################
// ### IndexedDB Setup for Caching Weather Data ###
// ###############################################

// Declare a variable to hold the database instance
let db;

// Define the name of the IndexedDB database
const dbName = 'WeatherDB';

// Define the version of the IndexedDB database
const dbVersion = 1;

// Define the name of the object store within the database
const storeName = 'weatherData';

// Open a connection to the IndexedDB database with the specified name and version
const request = indexedDB.open(dbName, dbVersion);

// Handle any errors that occur while opening the database
request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
};

// Handle the successful opening of the database
request.onsuccess = (event) => {
    // Store the opened database instance in the `db` variable
    db = event.target.result;
    console.log('IndexedDB opened successfully');
};

// Handle the scenario where the database needs to be upgraded (e.g., creating object stores)
request.onupgradeneeded = (event) => {
    // Store the database instance from the event
    db = event.target.result;

    // Create a new object store named 'weatherData' with 'city' as the key path
    const objectStore = db.createObjectStore(storeName, { keyPath: 'city' });
    console.log('Object store created');
};

// ###############################################
// ### Weather API Configuration and Functions ###
// ###############################################

// Define the API key for accessing the Weatherbit API
const API_KEY = '3822380c32db4d28a5ac8e4f7022c430'; //#####_change_1

// Define the base URL for the Weatherbit current weather API
const API_URL = 'https://api.weatherbit.io/v2.0/current';

/**
 * Fetches weather data for a given city.
 * @param {string} city - The name of the city to fetch weather data for.
 */
async function getWeather(city) {
    try {
        // Attempt to retrieve cached weather data for the specified city
        const cachedData = await getCachedWeather(city);

        // Check if the browser is online
        if (navigator.onLine) {
            // Log that data is being gathered from the API since the browser is online
            console.log("Gathering Data from the API Online.");

            // Fetch weather data from the Weatherbit API using the city name and API key
            const response = await fetch(`${API_URL}?city=${city}&key=${API_KEY}`);

            // Parse the JSON response from the API
            const data = await response.json();

            // Check if the API returned valid data for the city
            if (data.data && data.data.length > 0) {
                // Extract the first (and presumably only) weather data entry
                const weatherData = data.data[0];

                // Cache the fetched weather data in IndexedDB
                await cacheWeatherData(weatherData);

                // Display the weather data on the webpage
                displayWeather(weatherData);
            } else {
                // Throw an error if the city was not found in the API response
                throw new Error('City not found');
            }
        } else if (cachedData) {
            // Log that data is being gathered from IndexedDB since the browser is offline
            console.log("Gathering Data from the IndexedDB without a Network Connection.");

            // Display the cached weather data on the webpage
            displayWeather(cachedData);
        } else {
            // Log that data cannot be retrieved from either the API or IndexedDB
            console.log("Cannot receive data from API or IndexedDB.");

            // Display an error message on the webpage indicating no available data
            document.getElementById('weatherInfo').textContent = 'Error: No weather data available.';
        }
    } catch (error) {
        // Log any errors that occur during the fetch process
        console.error('Error fetching weather:', error);

        // Display a generic error message on the webpage
        document.getElementById('weatherInfo').textContent = 'Error fetching weather data';
    }
}

/**
 * Displays the weather data on the webpage.
 * @param {Object} weatherData - The weather data to display.
 */
function displayWeather(weatherData) {
    // Get the HTML element where weather information will be displayed
    const weatherInfo = document.getElementById('weatherInfo');

    // Populate the element with formatted weather information
    weatherInfo.innerHTML = `
        <h2>${weatherData.city_name}, ${weatherData.state_code}</h2>
        <p>Temperature: ${weatherData.temp}°C</p>
        <p>Feels like temp: ${weatherData.app_temp}°C</p>
        <p>Sunrise: ${weatherData.sunrise}    Sunset: ${weatherData.sunset}</p>
        <p>Weather: ${weatherData.weather.description}</p>
        <p>Wind: ${weatherData.wind_spd} m/s, ${weatherData.wind_cdir_full}</p>
    `;
}

/**
 * Caches the provided weather data in IndexedDB.
 * @param {Object} weatherData - The weather data to cache.
 * @returns {Promise} - Resolves when caching is complete.
 */
async function cacheWeatherData(weatherData) {
    return new Promise((resolve, reject) => {
        // Start a new readwrite transaction on the specified object store
        const transaction = db.transaction([storeName], 'readwrite');

        // Access the object store within the transaction
        const objectStore = transaction.objectStore(storeName);

        // Prepare the data to be stored, including city name, data, and a timestamp
        const request = objectStore.put({
            city: weatherData.city_name.toLowerCase(),
            data: weatherData,
            timestamp: Date.now()
        });

        // Handle any errors that occur during the put operation
        request.onerror = (event) => {
            reject('Error caching weather data');
        };

        // Resolve the promise once the data is successfully cached
        request.onsuccess = (event) => {
            resolve();
        };
    });
}

/**
 * Retrieves cached weather data for a given city from IndexedDB.
 * @param {string} city - The name of the city to retrieve cached data for.
 * @returns {Promise<Object|null>} - Resolves with the cached data or null if not found or outdated.
 */
async function getCachedWeather(city) {
    return new Promise((resolve, reject) => {
        // Start a new readonly transaction on the specified object store
        const transaction = db.transaction([storeName], 'readonly');

        // Access the object store within the transaction
        const objectStore = transaction.objectStore(storeName);

        // Attempt to get the cached data for the specified city
        const request = objectStore.get(city.toLowerCase());

        // Handle any errors that occur during the get operation
        request.onerror = (event) => {
            reject('Error getting cached weather data');
        };

        // Process the result once the get operation is successful
        request.onsuccess = (event) => {
            const result = event.target.result;

            // Check if data exists and is not older than 30 minutes (30 * 60 * 1000 ms)
            if (result && (Date.now() - result.timestamp < 30 * 60 * 1000)) {
                resolve(result.data);
            } else {
                // Resolve with null if no valid cached data is found
                resolve(null);
            }
        };
    });
}

// ##################################################
// ### Event Listener for 'Get Weather' Button Click ###
// ##################################################

// Add an event listener to the 'Get Weather' button to trigger weather fetching
document.getElementById('getWeather').addEventListener('click', () => {
    // Retrieve the city name entered by the user in the input field
    const city = document.getElementById('location').value;

    // Check if a city name was provided
    if (city) {
        // Call the getWeather function with the specified city
        getWeather(city);
    }
});
