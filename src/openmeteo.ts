import type {ForecastLocation, TimeSeriesObservation, Weather} from "./types";
import {reverseGeocoding} from "@/openweather";
import {fetchWeatherApi} from "openmeteo";

const params = {
    "latitude": 61.4511,
    "longitude": 23.8517,
    "hourly": ["temperature_2m", "relative_humidity_2m", "precipitation_probability", "precipitation", "weather_code", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"],
    "wind_speed_unit": "ms",
    "timeformat": "unixtime",
    "forecast_days": 10,
    "models": "best_match"
};
const url = "https://api.open-meteo.com/v1/forecast";
const cache = new Map<string, Weather | Promise<Weather>>();

export const getWeather = async (lat: number, lon: number): Promise<Weather> => {
    const key = `${lat},${lon}`;
    if(cache.has(key)) {
        const value = cache.get(key);
        if(value instanceof Promise) {
            return await value;
        } else if(value && value.updated.getTime() > Date.now() - 1000 * 60 * 60) { // 1 hour cache
            return value;
        }
    }

    let resolve: (value: Weather) => void;
    cache.set(key, new Promise((r) => resolve = r) as Promise<Weather>);

    const responses = await fetchWeatherApi(url, {
        ...params,
        latitude: lat,
        longitude: lon
    }, 3);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    const response = responses[0];

    const hourly = response.hourly()!;
    const time = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
        (time) => new Date(time * 1000)
    )

    const toTimeSeries = (val: number, index: number): TimeSeriesObservation => {
        return {
            time: time[index],
            value: val
        }
    };

    const out: Weather = {
        humidity: Array.from(hourly.variables(1)!.valuesArray()!).map(toTimeSeries),
        temperature: Array.from(hourly.variables(0)!.valuesArray()!).map(toTimeSeries),
        windDirection: Array.from(hourly.variables(6)!.valuesArray()!).map(toTimeSeries),
        windSpeed: Array.from(hourly.variables(5)!.valuesArray()!).map(toTimeSeries),
        windGust: Array.from(hourly.variables(7)!.valuesArray()!).map(toTimeSeries),
        precipitation: Array.from(hourly.variables(3)!.valuesArray()!).map(toTimeSeries),
        probabilityOfPrecipitation: Array.from(hourly.variables(2)!.valuesArray()!).map(toTimeSeries),
        weatherSymbol: Array.from(hourly.variables(4)!.valuesArray()!).map(toTimeSeries).map((val: TimeSeriesObservation) => {
            const swapTable: Record<number, number> = {
                0: 1, 1: 2, 2: 3, 3: 4, 45: 92, 48: 92, 51: 21, 53: 22, 55: 23, 56: 72, 57: 73,
                61: 31, 63: 32, 65: 33, 66: 82, 67: 83, 71: 51, 73: 52, 75: 53, 77: 53, 80: 21,
                81: 22, 82: 23, 85: 41, 86: 43, 95: 64, 96: 62, 99: 64
            };
            return {
                ...val,
                value: swapTable[val.value] || val.value
            }
        }),
        feelsLike: Array.from(hourly.variables(0)!.valuesArray()!).map(toTimeSeries),
        location: await reverseGeocoding(lat, lon),
        updated: new Date()
    };

    // Make forecast interval 3 hours after the first 70 hours
    for(const key of Object.keys(out)) {
        if(Array.isArray(out[key as keyof Weather])) {
            // @ts-ignore
            out[key as keyof Weather] = out[key as keyof Weather]?.filter((_, i) => i < 70 || i % 3 === 0);
        }
    }

    console.log("Weather fetched", out);

    resolve!(out);
    cache.set(key, out);
    return out;
};

let controller: AbortController | undefined;
export const getAutoCompleteResults = async (query: string, language: string): Promise<ForecastLocation[] | undefined> => {
    if(controller) controller.abort("New request");
    controller = new AbortController();
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&language=${language}&count=50&language=en&format=json`, {signal: controller.signal});
    if(!response?.ok) return undefined;
    const data = await response.json();
    const results = data.results.sort((a: any, b: any) => b.population - a.population);
    return results.slice(0, 5).map((result: any) => ({
        name: result.name,
        country: result.country_code,
        region: result.admin3,
        lat: result.latitude,
        lon: result.longitude,
        identifier: result.id
    }));
};
