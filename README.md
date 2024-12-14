# weather-vue

A simple weather app built with Vue.js utilizing the OpenData API from the Finnish Meteorological Institute
, the OpenWeatherMap API and OpenMeteo API.

This uses FMI OpenData as the primary source of weather data,
but OpenWeatherMap is used to complement the data when FMI OpenData does not have enough data available.

### Weather Icons used in this project

This project uses the [Weather Icons by Bas Milius](https://github.com/basmilius/weather-icons).
The icons are renamed according to the
[OpenData weather icon explanations](https://www.ilmatieteenlaitos.fi/latauspalvelun-pikaohje).

### Environment variables

This project uses environment variables to store the API keys and other configuration.  

| Variable              | Description                                                                   | Default value |
|-----------------------|-------------------------------------------------------------------------------|---------------|
| VITE_OPEN_WEATHER     | OpenWeather API Key<br/>Needs to have OneCall API enabled.                    |               |
| VITE_MML              | National Land Survey of Finland API key                                       |               |
| VITE_DEFAULT_LANGUAGE | Default language for the app.                                                 | `fi`          |
| VITE_EXECUTION_NUMBER | App version/run number.<br/>Displayed at the bottom of the navigation drawer. | `dev`         |

### Screenshot
![SC](/public/screenshots/screenshot-1.webp)
