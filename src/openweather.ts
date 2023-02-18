import { OpenWeatherAPI } from 'openweather-api-node';
import Settings from "@/settings";
import type { TimeSeriesObservation, OpenWeather } from "@/types";

export function get5DayForecastLatLon(lat: number, lon: number) {
    let weather = new OpenWeatherAPI({
        key: Settings.openWeatherApiKey,
        units: 'metric'
    });
    return new Promise((resolve) => {
        weather.setLocationByCoordinates(lat, lon);
        weather.getForecast().then(forecast => {
            console.log(forecast);
            const weather = toWeather(forecast);
            console.log(weather)
            resolve(weather);
        }).catch((error) => {
            console.error(error);
            resolve({} as OpenWeather);
        });
    }) as Promise<OpenWeather>;
}

export function get5DayForecastPlace(place: string) {
    let weather = new OpenWeatherAPI({
        key: Settings.openWeatherApiKey,
        units: 'metric'
    });
    return new Promise((resolve) => {
        weather.setLocationByName(place)
        weather.getForecast().then(forecast => {
            console.log(forecast);
            const weather = toWeather(forecast);
            console.log(weather)
            resolve(weather);
        }).catch((error) => {
            console.error(error);
            resolve({} as OpenWeather);
        });
    }) as Promise<OpenWeather>;
}

function toWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = {
        humidity: [] as TimeSeriesObservation[],
        temperature: [] as TimeSeriesObservation[],
        probabilityOfPrecipitation: [] as TimeSeriesObservation[],
        windDirection: [] as TimeSeriesObservation[],
        windSpeed: [] as TimeSeriesObservation[],
        windGust: [] as TimeSeriesObservation[],
        precipitation: [] as TimeSeriesObservation[],
        weatherSymbol: [] as TimeSeriesObservation[],
        feelsLike: [] as TimeSeriesObservation[],
    }
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        weather.humidity.push({ time, value: forecast.main.humidity });
        weather.temperature.push({ time, value: forecast.main.temp });
        weather.probabilityOfPrecipitation.push({ time, value: forecast.pop });
        weather.windDirection.push({ time, value: forecast.wind.deg });
        weather.windSpeed.push({ time, value: forecast.wind.speed });
        weather.windGust.push({ time, value: forecast.wind.gust });
        weather.precipitation.push({ time, value: Object.values(forecast.rain || {"1h": 0})[0] as number });
        weather.weatherSymbol.push({ time, value: forecast.weather[0].description }); // TODO: Convert to FMI symbol numbers
        weather.feelsLike.push({ time, value: forecast.main.feels_like });
    });
    return weather;
}
