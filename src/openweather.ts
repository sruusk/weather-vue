import {OpenWeatherApiKey} from "@/constants";
import type {ForecastLocation, OpenWeather, TimeSeriesObservation, Warnings} from "@/types";

if (!OpenWeatherApiKey) alert("OpenWeather API key not set!");

export function search(str: string): Promise<{
    name: string,
    lat: number,
    lon: number,
    country: string,
    state: string
}[]> {
    str = str.replace(",", " ");
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURI(str)}&limit=5&appid=${OpenWeatherApiKey}`;
    return fetch(url).then(response => response.json()).then(list => list.map((data: {
        name: string;
        lat: number;
        lon: number;
        country: string;
        state: string;
    }) => {
        return {
            name: data.name,
            lat: data.lat,
            lon: data.lon,
            country: data.country,
            state: data.state
        }
    }))
}

export function reverseGeocoding(lat: number, lon: number): Promise<ForecastLocation> {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OpenWeatherApiKey}`;
    return fetch(url).then(response => response.json()).then(data => {
        return {
            name: data[0].name,
            identifier: '',
            region: data[0].state || data[0].country,
            country: data[0].country,
            lat: data[0].lat,
            lon: data[0].lon,
        }
    })
}

export function get5DayForecastLatLon(lat: number, lon: number) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OpenWeatherApiKey}`;
    return fetchOpenWeather(url);
}

function fetchOpenWeather(url: string, retry: number = 3): Promise<OpenWeather> {
    return new Promise((resolve) => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            //console.log("OpenWeather", data);
            const weather = toWeather(data.list);
            resolve(weather);
        }).catch((error) => {
            console.error("OpenWeather fetchOpenWeather():", error);
            if (retry > 0) resolve(fetchOpenWeather(url, retry - 1));
        });
    }) as Promise<OpenWeather>;
}

export function getHourlyForecastLatLon(lat: number, lon: number, retry: number = 3): Promise<OpenWeather> {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${OpenWeatherApiKey}&retry=${retry}`;
    return new Promise(resolve => {
        fetch(url).then(response => {
            return response.json();
        }).then(data => {
            // Check timestamp
            const timestamp = data.current.dt * 1000;
            const now = new Date();
            if (timestamp < now.getTime() - 60 * 60 * 1000) { // 1 hour
                console.log("OpenWeather getHourlyForecastLatLon(): timestamp is too old, retrying");
                resolve(getHourlyForecastLatLon(lat, lon, retry - 1));
                return;
            }

            const weather: OpenWeather = oneCallToWeather(data.hourly);
            const dailyWeather: OpenWeather = oneCallDailyToWeather(data.daily, weather.temperature[weather.temperature.length - 1].time);

            Object.keys(weather).forEach((key) => {
                // @ts-ignore
                weather[key] = weather[key]?.concat(dailyWeather[key]);
            });

            resolve(weather);
        }).catch((error) => {
            console.error("OpenWeather getHourlyForecastLatLon():", lat, lon, error);
            if (retry > 0) {
                console.log("OpenWeather getHourlyForecastLatLon(): retrying", retry);
                resolve(getHourlyForecastLatLon(lat, lon, retry - 1));
            }
        });
    })
}

// noinspection JSUnusedLocalSymbols
function parseAlerts(alerts: any): Warnings {
    const warnings = {} as Warnings;
    alerts.forEach((alert: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = (alert.start * 1000 - today.getTime()) / 1000 / 60 / 60 / 24;
        const end = (alert.end * 1000 - today.getTime()) / 1000 / 60 / 60 / 24;
        for (let i = Math.max(Math.floor(start), 0); i <= Math.floor(end); i++) {
            // @ts-ignore
            warnings[i] = {
                severity: "Moderate"
            }
        }
    });
    console.log("OpenWeather Alerts", warnings, alerts);
    return warnings;
}

function getFMIWeatherSymbolCode(icon: string): number {
    switch (parseInt(icon)) {
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
            console.error("OpenWeather getFMIWeatherSymbolCode(): Unknown icon code", icon);
            return 1;
    }
}

function oneCallToWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        weather.humidity.push({time, value: forecast.humidity});
        weather.temperature.push({time, value: forecast.temp});
        weather.probabilityOfPrecipitation.push({time, value: Math.round(forecast.pop * 100)});
        weather.windDirection.push({time, value: forecast.wind_deg});
        weather.windSpeed.push({time, value: forecast.wind_speed});
        weather.windGust.push({time, value: forecast.wind_gust});
        weather.precipitation.push({
            time,
            value: Object.values(forecast.rain || forecast.snow || {"1h": 0})[0] as number
        });
        weather.weatherSymbol.push({time, value: getFMIWeatherSymbolCode(forecast.weather[0].icon)});
        weather.feelsLike.push({time, value: forecast.feels_like});
    });
    // Remove current hour weather
    const currentTime = new Date();
    Object.keys(weather).forEach(key => {
        // @ts-ignore
        weather[key] = weather[key]?.filter((item: TimeSeriesObservation) => item.time.getTime() > currentTime.getTime());
    });
    return weather;
}

function oneCallDailyToWeather(daily: any, start: Date): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    daily.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        const times = {
            night: new Date(time.setHours(0, 0, 0, 0)),
            morn: new Date(time.setHours(6, 0, 0, 0)),
            day: new Date(time.setHours(12, 0, 0, 0)),
            eve: new Date(time.setHours(18, 0, 0, 0)),
        }
        if (times.eve.getTime() < start.getTime()) return;
        Object.entries(times).forEach(([key, time]) => {
            weather.humidity.push({time, value: forecast.humidity});
            weather.temperature.push({time, value: forecast.temp[key]});
            weather.probabilityOfPrecipitation.push({time, value: Math.round(forecast.pop * 100 / 4)});
            weather.windDirection.push({time, value: forecast.wind_deg});
            weather.windSpeed.push({time, value: forecast.wind_speed});
            weather.windGust.push({time, value: forecast.wind_gust});
            weather.precipitation.push({
                time,
                value: parseFloat(((forecast.rain || forecast.snow || 0) / 4).toFixed(1))
            });
            weather.weatherSymbol.push({time, value: getFMIWeatherSymbolCode(forecast.weather[0].icon)});
            weather.feelsLike.push({time, value: forecast.feels_like[key]});
        });
    });
    return weather;
}

function toWeather(forecastList: any): OpenWeather {
    const weather: OpenWeather = getEmptyOpenWeather();
    forecastList.forEach((forecast: any) => {
        const time = new Date(forecast.dt * 1000);
        weather.humidity.push({time, value: forecast.main.humidity});
        weather.temperature.push({time, value: forecast.main.temp});
        weather.probabilityOfPrecipitation.push({time, value: Math.round(forecast.pop * 100)});
        weather.windDirection.push({time, value: forecast.wind.deg});
        weather.windSpeed.push({time, value: forecast.wind.speed});
        weather.windGust.push({time, value: forecast.wind.gust});
        weather.precipitation.push({
            time,
            value: Object.values(forecast.rain || forecast.snow || {"1h": 0})[0] as number
        });
        weather.weatherSymbol.push({time, value: getFMIWeatherSymbolCode(forecast.weather[0].icon)});
        weather.feelsLike.push({time, value: forecast.main.feels_like});
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
