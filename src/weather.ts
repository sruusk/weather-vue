// noinspection NonAsciiCharacters

import type {ForecastLocation, TimeSeriesObservation, Weather, ObservationStation, ObservationStationLocation, DayLength, OpenWeather} from './types';
import { get5DayForecastLatLon, getHourlyForecastLatLon, reverseGeocoding } from "@/openweather";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
const parser = new XMLParser({
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    parseAttributeValue: true
});
const params = [
    'Humidity',
    'Temperature',
    'WindDirection',
    'WindSpeedMS',
    'WindGust',
    'Precipitation1h',
    'WeatherSymbol3',
    'FeelsLike'
];
const baseUrl = 'https://opendata.fmi.fi/wfs?request=getFeature';
function getStartAndEndTimeQuery(start: Date, end: Date) {
    return `&starttime=${start.toISOString()}&endtime=${end.toISOString()}`;
}

function getTimeFromNow(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function getBaseWithDays(offset: number, days: number) {
    let start = getTimeFromNow(offset);
    let end = getTimeFromNow(offset + days);
    if(offset) start.setMinutes(0, 0, 0);
    while(offset && start.getHours() % 3 !== 0) { // Start time must be divisible by 3
        start = new Date(start.getTime() + 60 * 60 * 1000); // Add one hour
    }
    start = new Date(start.setHours(0, 0, 0, 0));
    end = new Date(end.setHours(23, 59, 59, 999));
    return baseUrl + getStartAndEndTimeQuery(start, end);
}

function getWeatherNextHour(lat: number, lon: number): Promise<Weather> {
    const url = getBaseWithDays(0, 3)
        + `&latlon=${lat},${lon}`
        + `&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair`
        + `&parameters=${params.join(',')}`;

    const xml = getXml(url);
    const weather = parseWeather(xml);
    return weather.then((value) => {
        if(value.temperature?.length) return value;
        else return getHourlyForecastLatLon(lat, lon).then((value) => {
            return new Promise((resolve) => {
                reverseGeocoding(lat, lon).then((location) => {
                    resolve({
                        ...value,
                        location,
                        updated: new Date()
                    });
                });
            });
        });
    });
}

function getWeather(place: string) {
    // https://opendata.fmi.fi/wfs
    // ?request=getFeature
    // &starttime=2023-02-06T23:00:00.000Z
    // &endtime=2023-02-09T22:00:00.000Z
    // &latlon=60.1698557,24.9383791
    // &storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair
    // &parameters=Humidity,Temperature,WindDirection,WindSpeedMS,WindGust,Precipitation1h,WeatherSymbol3

    const url = getBaseWithDays(0, 3)
    + `&place=${place}`
    + `&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair`
    + `&parameters=${params.join(',')}`;

    const xml = getXml(url);
    return parseWeather(xml);
}

function getWeatherByLatLon(lat: number, lon: number) {
    const url = getBaseWithDays(0, 3)
    + `&latlon=${lat},${lon}`
    + `&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair`
    + `&parameters=${params.join(',')}`;

    const xml = getXml(url);
    return mergeWeather(parseWeather(xml).then(weather => {
        if(weather.temperature?.length) return weather;
        else return getHourlyForecastLatLon(lat, lon) as Promise<Weather>;
    }), get5DayForecastLatLon(lat, lon));
}

function mergeWeather(shortWeather: Promise<Weather>, longWeather: Promise<OpenWeather>) {
    return new Promise((resolve, reject) => {
        Promise.all([shortWeather, longWeather]).then((values) => {
            let short = values[0];
            let long = values[1];
            if(Object.keys(long).length === 0) resolve(short);
            else if(Object.keys(short).length <= 1) resolve( { ...short, ...long } as Weather );

            // Clip long forecast to start at short forecast end
            let shortEndTime = short.temperature[0].time;
            for(const time of short.temperature.map((value) => value.time)) {
                if(time.getTime() - shortEndTime.getTime() > 1000 * 60 * 60 * 3) break; // If there is a gap of more than 3 hours, stop
                if(time > shortEndTime) shortEndTime = time;
            }

            long = {
                humidity: long.humidity.filter((value) => value.time > shortEndTime),
                temperature: long.temperature.filter((value) => value.time > shortEndTime),
                windDirection: long.windDirection.filter((value) => value.time > shortEndTime),
                windSpeed: long.windSpeed.filter((value) => value.time > shortEndTime),
                windGust: long.windGust.filter((value) => value.time > shortEndTime),
                precipitation: long.precipitation.filter((value) => value.time > shortEndTime),
                probabilityOfPrecipitation: long.probabilityOfPrecipitation.filter((value) => value.time > shortEndTime),
                weatherSymbol: long.weatherSymbol.filter((value) => value.time > shortEndTime),
                feelsLike: long.feelsLike.filter((value) => value.time > shortEndTime)
            } as OpenWeather;

            const longEndTime = long.temperature[long.temperature.length - 1].time;

            const weather: Weather = {
                humidity: short.humidity.filter((value) => value.time <= shortEndTime).concat(long.humidity).concat(short.humidity.filter((value) => value.time > longEndTime)),
                temperature: short.temperature.filter((value) => value.time <= shortEndTime).concat(long.temperature).concat(short.temperature.filter((value) => value.time > longEndTime)),
                windDirection: short.windDirection.filter((value) => value.time <= shortEndTime).concat(long.windDirection).concat(short.windDirection.filter((value) => value.time > longEndTime)),
                windSpeed: short.windSpeed.filter((value) => value.time <= shortEndTime).concat(long.windSpeed).concat(short.windSpeed.filter((value) => value.time > longEndTime)),
                windGust: short.windGust.filter((value) => value.time <= shortEndTime).concat(long.windGust).concat(short.windGust.filter((value) => value.time > longEndTime)),
                precipitation: short.precipitation.filter((value) => value.time <= shortEndTime).concat(long.precipitation).concat(short.precipitation.filter((value) => value.time > longEndTime)),
                probabilityOfPrecipitation: short.probabilityOfPrecipitation
                    ? short.probabilityOfPrecipitation.filter((value) => value.time <= shortEndTime).concat(long.probabilityOfPrecipitation).concat(short.probabilityOfPrecipitation.filter((value) => value.time > longEndTime))
                    : long.probabilityOfPrecipitation ? long.probabilityOfPrecipitation : undefined,
                weatherSymbol: short.weatherSymbol.filter((value) => value.time <= shortEndTime).concat(long.weatherSymbol).concat(short.weatherSymbol.filter((value) => value.time > longEndTime)),
                feelsLike: short.feelsLike.filter((value) => value.time <= shortEndTime).concat(long.feelsLike).concat(short.feelsLike.filter((value) => value.time > longEndTime)),
                location: short.location,
                updated: short.updated
            }
            resolve(weather);
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<Weather>;
}

function getXml(url: string, retries: number = 3) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response) => {
                if (response.ok) {
                    return response.text();
                } else if (response.status === 400) { // FMI returns 400 if no data is available for the requested location
                    console.warn('Bad request to FMI API');
                    return response.text();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then((text) => {
                const json = parser.parse(text);
                resolve(json);
            })
            .catch((error) => {
                console.error('Error fetching weather data', error);
                if(retries > 0) resolve(getXml(url, retries - 1));
                else reject(error);
            });
    }) as Promise<any>;
}

function parseWeather(xml: Promise<any>) {
    return new Promise((resolve, reject) => {
        xml.then(async (json) => {
            if(json['ExceptionReport']) {
                const text = json['ExceptionReport']['Exception']?.['ExceptionText'];
                if(text) {
                    if(Array.isArray(text)) console.warn('FMI API returned exception report\n', text.join('\n'));
                    else console.warn('FMI API returned exception report\n', text);
                }
                else console.warn('FMI API returned exception report\n', json['ExceptionReport']);
                const cityName = json['ExceptionReport']['Exception']['ExceptionText'][0].split('\'')[1];
                resolve({
                    location: {
                        name: cityName
                    },
                } as Weather);
            }

            const data = json['wfs:FeatureCollection']['wfs:member'];
            const weather: Weather = {
                humidity: parseTimeSeriesObservation(data[0]),
                temperature: parseTimeSeriesObservation(data[1]),
                windDirection: parseTimeSeriesObservation(data[2]),
                windSpeed: parseTimeSeriesObservation(data[3]),
                windGust: parseTimeSeriesObservation(data[4]),
                precipitation: parseTimeSeriesObservation(data[5]),
                probabilityOfPrecipitation: undefined,
                weatherSymbol: parseTimeSeriesObservation(data[6]),
                feelsLike: parseTimeSeriesObservation(data[7]),
                location: parseLocation(data[0]),
                updated: parseDate(data[0])
            }

            const oneCall = await getHourlyForecastLatLon(weather.location.lat, weather.location.lon);
            const lastTime = weather.temperature[weather.temperature.length - 1].time;
            weather.probabilityOfPrecipitation = oneCall.probabilityOfPrecipitation.filter((value) => value.time <= lastTime);

            // remove NaN values
            weather.humidity = weather.humidity.filter((value) => !isNaN(value.value)).concat(oneCall.humidity.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.temperature = weather.temperature.filter((value) => !isNaN(value.value)).concat(oneCall.temperature.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.windDirection = weather.windDirection.filter((value) => !isNaN(value.value)).concat(oneCall.windDirection.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.windSpeed = weather.windSpeed.filter((value) => !isNaN(value.value)).concat(oneCall.windSpeed.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.windGust = weather.windGust.filter((value) => !isNaN(value.value)).concat(oneCall.windGust.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.precipitation = weather.precipitation.filter((value) => !isNaN(value.value)).concat(oneCall.precipitation.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.probabilityOfPrecipitation = weather.probabilityOfPrecipitation.filter((value) => !isNaN(value.value)).concat(oneCall.probabilityOfPrecipitation.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.weatherSymbol = weather.weatherSymbol.filter((value) => !isNaN(value.value)).concat(oneCall.weatherSymbol.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));
            weather.feelsLike = weather.feelsLike.filter((value) => !isNaN(value.value)).concat(oneCall.feelsLike.filter((value) => new Date(value.time.getTime() - 1000 * 60 * 60 * 24) > lastTime));

            // remove values from the past
            const now = new Date();
            weather.humidity = weather.humidity.filter((value) => value.time >= now);
            weather.temperature = weather.temperature.filter((value) => value.time >= now);
            weather.windDirection = weather.windDirection.filter((value) => value.time >= now);
            weather.windSpeed = weather.windSpeed.filter((value) => value.time >= now);
            weather.windGust = weather.windGust.filter((value) => value.time >= now);
            weather.precipitation = weather.precipitation.filter((value) => value.time >= now);
            weather.probabilityOfPrecipitation = weather.probabilityOfPrecipitation.filter((value) => value.time >= now);
            weather.weatherSymbol = weather.weatherSymbol.filter((value) => value.time >= now);
            weather.feelsLike = weather.feelsLike.filter((value) => value.time >= now);

            resolve(weather);
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<Weather>;
}

function parseTimeSeriesObservation(data: any) {
    const timeSeries = data['omso:PointTimeSeriesObservation']['om:result']['wml2:MeasurementTimeseries']['wml2:point'] as Array<any>;
    return timeSeries.map((item: any) => {
        return {
            time: new Date(item['wml2:MeasurementTVP']['wml2:time']),
            value: parseFloat(item['wml2:MeasurementTVP']['wml2:value'])
        }
    }) as TimeSeriesObservation[];
}

function parseLocation(data: any) {
    const location = data['omso:PointTimeSeriesObservation']
        ['om:featureOfInterest']
        ['sams:SF_SpatialSamplingFeature']
        ['sam:sampledFeature']
        ['target:LocationCollection']
        ['target:member']
        ['target:Location'];
    const pos = data['omso:PointTimeSeriesObservation']
        ['om:featureOfInterest']
        ['sams:SF_SpatialSamplingFeature']
        ['sams:shape']
        ['gml:MultiPoint']
        ['gml:pointMembers']
        ['gml:Point']
        ['gml:pos'].trim().split(' ');
    return {
        identifier: location['gml:identifier']["#text"],
        name: location['gml:name'][0]["#text"],
        region: location['target:region']["#text"],
        country: location['target:country']["#text"],
        lat: parseFloat(pos[0]),
        lon: parseFloat(pos[1])
    } as ForecastLocation;
}

function parseDate(data: any): Date {
    const date = data['omso:PointTimeSeriesObservation']['om:resultTime']['gml:TimeInstant']['gml:timePosition'];
    return new Date(date);
}

export function getObservationsForClosestStations(lat: number, lon: number, count: number) {
    return new Promise((resolve, reject) => {
        getClosestStations(lat, lon, count).then((stations) => {
            const promises = stations.map((station) => {
                return getObservationsForStation(station).catch((error) => {
                    console.log(error);
                    return null;
                });
            });
            Promise.all(promises).then((values) => {
                resolve(
                    (values.filter((value) => value != null) as Array<ObservationStation>)
                        .filter((station) => station.temperatureHistory?.length)
                );
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<ObservationStation[]>;
}

const observationStationParameters = [
    "humidity",
    "temperature",
    "dewpoint",
    "windspeedms",
    "winddirection",
    "windgust",
    "pri_pt1h_max", // precipitation intensity
    "snowdepth", // snow depth
    "p_sea", // pressure at sea level
    "ch1_aws", // cloud height
    "cla_pt1m_instant", // cloud amount (1/8)
    "vis", // visibility
    "wawa", // weather
]

function getObservationsForStation(station: ObservationStationLocation) {
    const url = baseUrl
        + '&fmisid=' + station.identifier
        + '&storedquery_id=fmi::observations::weather::timevaluepair'
        + '&parameters=' + observationStationParameters.join(',');
    return new Promise((resolve, reject) => {
        getXml(url).then((json) => {
            const data = json['wfs:FeatureCollection']['wfs:member'];
            if(!data) {
                reject('No data for station ' + station.identifier);
                return;
            }
            const temperatureHistory = parseTimeSeriesObservation(data[1]).filter((item) => !isNaN(item.value));
            const precipitationHistory = parseTimeSeriesObservation(data[6]).filter((item) => !isNaN(item.value));
            const weather = {
                location: station,
                time: new Date(data[0]['omso:PointTimeSeriesObservation']['om:resultTime']['gml:TimeInstant']['gml:timePosition']),
                humidity: lastObservation(parseTimeSeriesObservation(data[0])).value,
                temperature: lastObservation(temperatureHistory)?.value,
                dewPoint: lastObservation(parseTimeSeriesObservation(data[2])).value,
                windSpeed: lastObservation(parseTimeSeriesObservation(data[3])).value,
                windDirection: lastObservation(parseTimeSeriesObservation(data[4])).value,
                windGust: lastObservation(parseTimeSeriesObservation(data[5])).value,
                precipitation: lastObservation(precipitationHistory)?.value,
                snowDepth: lastObservation(parseTimeSeriesObservation(data[7])).value,
                pressure: lastObservation(parseTimeSeriesObservation(data[8])).value,
                cloudBase: lastObservation(parseTimeSeriesObservation(data[9])).value,
                cloudiness: lastObservation(parseTimeSeriesObservation(data[10])).value,
                visibility: lastObservation(parseTimeSeriesObservation(data[11])).value,
                weather: lastObservation(parseTimeSeriesObservation(data[12])).value,
                temperatureHistory: temperatureHistory,
                precipitationHistory: precipitationHistory
            } as any;
            // Remove undefined values and NaN values
            Object.keys(weather).forEach((key) => {
                if (weather[key] === undefined || (typeof weather[key] !== "object" && isNaN(weather[key]))) {
                    delete weather[key];
                }
            });
            resolve(weather);
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<ObservationStation>;
}

function lastObservation(observation: TimeSeriesObservation[]) {
    return observation[observation.length - 1] as TimeSeriesObservation;
}

function getClosestStations(lat: number, lon: number, count: number) {
    return new Promise((resolve, reject) => {
        getObservationStations(lat, lon).then((stations) => {
            stations.sort((a, b) => {
                return a.distance - b.distance;
            });
            resolve(stations.slice(0, count));
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<ObservationStationLocation[]>;
}

function getObservationStations(lat: number, lon: number) {
    const url = baseUrl + '&storedquery_id=fmi::ef::stations';
    const xml = getXml(url);
    return new Promise((resolve, reject) => {
        xml.then((json) => {
            const stations = json['wfs:FeatureCollection']['wfs:member'] as Array<any>;
            const allStations = stations.map((station) => {
                    const pos = station['ef:EnvironmentalMonitoringFacility']
                        ['ef:representativePoint']
                        ['gml:Point']
                        ['gml:pos'].trim().split(' ');
                    let description = station["ef:EnvironmentalMonitoringFacility"]["ef:belongsTo"];
                    if(Array.isArray(description)) {
                        // join all descriptions to one string
                        description = description.map((desc: any) => desc["@_xlink:title"]).join(" ");
                    } else description = description["@_xlink:title"];
                    if(description.toLowerCase().includes("sääasema"))
                        return {
                            identifier: station['ef:EnvironmentalMonitoringFacility']['gml:identifier']["#text"],
                            name: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("name"))["#text"],
                            region: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("region"))["#text"],
                            country: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("country"))["#text"],
                            lat: parseFloat(pos[0]),
                            lon: parseFloat(pos[1]),
                            distance: distanceBetweenCoordinates([lat, lon], [parseFloat(pos[0]), parseFloat(pos[1])])
                        } as ObservationStationLocation;
                });
            resolve(allStations as ObservationStationLocation[]);
        }).catch((error) => {
            reject(error);
        });
    }) as Promise<ObservationStationLocation[]>;
}

function distanceBetweenCoordinates([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.abs(R * c) as number; // in metres
}

export function getDayLength(location: ForecastLocation) {
    return calculateSunPosition(location)
}

// @ts-ignore
import SunCalc from 'suncalc';
function calculateSunPosition(location: ForecastLocation) {
    const times = SunCalc.getTimes(new Date((new Date()).setHours(12, 0, 0, 0)), location.lat, location.lon)
    const isMidnightSun = isNaN(times.sunrise.getTime());
    const { start, end } = isMidnightSun ? calculateMidnightSun(location) : { start: new Date(), end: new Date() };
    return {
        sunrise: !isMidnightSun ? times.sunrise.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"}) : start.toLocaleDateString("fi-FI", {day: "numeric", month: "numeric"}),
        sunset: !isMidnightSun ? times.sunset.toLocaleTimeString("en-GB", {hour: "2-digit", minute: "2-digit"}) : end.toLocaleDateString("fi-FI", {day: "numeric", month: "numeric"}),
        lengthofday: `${Math.floor((times.sunset.getTime() - times.sunrise.getTime()) / 1000 / 60 / 60)}h ${Math.floor(((times.sunset.getTime() - times.sunrise.getTime()) / 1000 / 60) % 60)}min`,
    } as DayLength;
}

function calculateMidnightSun(location: ForecastLocation): { start: Date, end: Date } {
    const start = new Date((new Date()).setHours(12, 0, 0, 0));
    const end = new Date((new Date()).setHours(12, 0, 0, 0));
    while(isNaN(SunCalc.getTimes(start, location.lat, location.lon).sunrise.getTime())) start.setDate(start.getDate() - 1);
    while(isNaN(SunCalc.getTimes(end, location.lat, location.lon).sunset.getTime())) end.setDate(end.getDate() + 1);
    return { start, end };
}

export default {
    getWeather,
    getWeatherByLatLon,
    getWeatherNextHour
}
