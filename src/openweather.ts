import Settings from "@/settings";
import type {TimeSeriesObservation, OpenWeather, Warnings} from "@/types";

export function get5DayForecastLatLon(lat: number, lon: number) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${Settings.openWeatherApiKey}`;
    return fetchOpenWeather(url);
}

function fetchOpenWeather(url: string): Promise<OpenWeather> {
    return new Promise((resolve) => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            console.log("OpenWeather", data);
            const weather = toWeather(data.list);
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
            console.log("OpenWeather OneCall", data);
            const weather = oneCallToWeather(data.hourly)
            if(Settings.getWarnings) {
                if(data.alerts) weather.warnings = parseAlerts(data.alerts);
                else weather.warnings = {} as Warnings;
            }
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
    console.log("Warnings", warnings, alerts);
    return warnings;
}

function getFMIWeatherSymbolCode(description: string): number {
    switch (parseInt(description)) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        case 9:
            return 23;
        case 10:
            return 33;
        case 11:
            return 64;
        case 13:
            return 52;
        case 50:
            return 91;
        default:
            return 1;
    }
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
        weather.weatherSymbol.push({ time, value: getFMIWeatherSymbolCode(forecast.weather.icon) });
        weather.feelsLike.push({ time, value: forecast.feels_like });
    });
    // Remove current hour weather
    const currentTime = new Date();
    Object.keys(weather).forEach(key => {
        // @ts-ignore
        weather[key] = weather[key]?.filter((item: TimeSeriesObservation) => item.time.getTime() > currentTime.getTime());
    });
    return weather;
}

function toWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        weather.humidity.push({ time, value: forecast.main.humidity });
        weather.temperature.push({ time, value: forecast.main.temp });
        weather.probabilityOfPrecipitation.push({ time, value: forecast.pop });
        weather.windDirection.push({ time, value: forecast.wind.deg });
        weather.windSpeed.push({ time, value: forecast.wind.speed });
        weather.windGust.push({ time, value: forecast.wind.gust });
        weather.precipitation.push({ time, value: Object.values(forecast.rain || forecast.snow || {"1h": 0})[0] as number });
        weather.weatherSymbol.push({ time, value: getFMIWeatherSymbolCode(forecast.weather.icon) });
        weather.feelsLike.push({ time, value: forecast.main.feels_like });
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
