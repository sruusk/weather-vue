import { OpenWeatherAPI } from 'openweather-api-node';
import Settings from "@/settings";
import type {TimeSeriesObservation, OpenWeather, Warnings} from "@/types";

export function get5DayForecastLatLon(lat: number, lon: number) {
    let weather = new OpenWeatherAPI({
        key: Settings.openWeatherApiKey,
        units: 'metric'
    });
    return new Promise((resolve) => {
        weather.setLocationByCoordinates(lat, lon);
        weather.getForecast().then(forecast => {
            const weather = toWeather(forecast);
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
            const weather = toWeather(forecast);
            resolve(weather);
        }).catch((error) => {
            console.error(error);
            resolve({} as OpenWeather);
        });
    }) as Promise<OpenWeather>;
}

export function getHourlyForecastLatLon(lat: number, lon: number): Promise<OpenWeather> {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=metric&appid=${Settings.openWeatherApiKey}`;
    return new Promise(resolve => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            console.log("openWeather", data);
            const weather = oneCallToWeather(data.hourly)
            if(Settings.getWarnings && data.alerts) weather.warnings = parseAlerts(data.alerts);
            resolve(weather);
        }).catch((error) => {
            console.error(error);
            resolve({} as OpenWeather);
        });
    })
}

function parseAlerts(alerts: any): Warnings {
    const warnings = {} as Warnings;
    alerts.forEach((alert: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = (alert.start * 1000 - today.getTime()) / 1000 / 60 / 60 / 24;
        const end = (alert.end * 1000 - today.getTime()) / 1000 / 60 / 60 / 24;
        for(let i = Math.max(Math.floor(start), 0); i <= Math.floor(end); i++ ){
            // @ts-ignore
            warnings[i] = {
                severity: "Moderate"
            }
        }
    });
    console.log("Warnings", warnings);
    return warnings;
}

function oneCallToWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        weather.humidity.push({ time, value: forecast.humidity });
        weather.temperature.push({ time, value: forecast.temp });
        weather.probabilityOfPrecipitation.push({ time, value: forecast.pop });
        weather.windDirection.push({ time, value: forecast.wind_deg });
        weather.windSpeed.push({ time, value: forecast.wind_speed });
        weather.windGust.push({ time, value: forecast.wind_gust });
        weather.precipitation.push({ time, value: Object.values(forecast.rain || {"1h": 0})[0] as number });
        weather.weatherSymbol.push({ time, value: forecast.weather.description }); // TODO: Convert to FMI symbol numbers
        weather.feelsLike.push({ time, value: forecast.feels_like });
    });
    return weather;
}

function toWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt);
        weather.humidity.push({ time, value: forecast.weather.humidity });
        weather.temperature.push({ time, value: forecast.weather.temp.cur });
        weather.probabilityOfPrecipitation.push({ time, value: forecast.weather.pop });
        weather.windDirection.push({ time, value: forecast.weather.wind.deg });
        weather.windSpeed.push({ time, value: forecast.weather.wind.speed });
        weather.windGust.push({ time, value: forecast.weather.wind.gust });
        weather.precipitation.push({ time, value: Object.values(forecast.weather.rain || {"1h": 0})[0] as number });
        weather.weatherSymbol.push({ time, value: forecast.weather.description }); // TODO: Convert to FMI symbol numbers
        weather.feelsLike.push({ time, value: forecast.weather.feelsLike.cur });
    });
    return weather;
}

function getEmptyOpenWeather() {
    return {
        warnings: undefined,
        humidity: [] as TimeSeriesObservation[],
        temperature: [] as TimeSeriesObservation[],
        probabilityOfPrecipitation: [] as TimeSeriesObservation[],
        windDirection: [] as TimeSeriesObservation[],
        windSpeed: [] as TimeSeriesObservation[],
        windGust: [] as TimeSeriesObservation[],
        precipitation: [] as TimeSeriesObservation[],
        weatherSymbol: [] as TimeSeriesObservation[],
        feelsLike: [] as TimeSeriesObservation[],
    };
}
