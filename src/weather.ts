// noinspection NonAsciiCharacters

import type {
    DayLength,
    ForecastLocation,
    ObservationStation,
    ObservationStationLocation,
    TimeSeriesObservation,
    Weather
} from './types';
import { getWeather as getOpenMeteoWeather } from "@/openmeteo";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
// @ts-ignore
import SunCalc from 'suncalc';

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
    if (offset) start.setMinutes(0, 0, 0);
    while (offset && start.getHours() % 3 !== 0) { // Start time must be divisible by 3
        start = new Date(start.getTime() + 60 * 60 * 1000); // Add one hour
    }
    start = new Date(start.setHours(0, 0, 0, 0));
    end = new Date(end.setHours(23, 59, 59, 999));
    return baseUrl + getStartAndEndTimeQuery(start, end);
}

const getWeatherNextHour = getWeatherByLatLon;

function getLocation(place: string): Promise<ForecastLocation> {
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

    return new Promise(async (resolve, reject) => {
        const xml = await getXml(url);
        if(xml['ExceptionReport']) {
            const text = xml['ExceptionReport']['Exception']?.['ExceptionText'];
            if (text) {
                if (Array.isArray(text)) console.warn('FMI API returned exception report\n', text.join('\n'));
                else console.warn('FMI API returned exception report\n', text);
            } else console.warn('FMI API returned exception report\n', xml['ExceptionReport']);
            reject('FMI API returned exception report');
        }

        resolve(parseLocation(xml['wfs:FeatureCollection']['wfs:member'][0]));
    });
}

function getWeatherByLatLon(lat: number, lon: number): Promise<Weather> {
    return getOpenMeteoWeather(lat, lon);
}

function getXml(url: string, retries: number = 3, timeout: number = 60000): Promise<any> {
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const signal = controller.signal;

        const timer = setTimeout(() => {
            controller.abort();
        }, timeout);

        fetch(url, {signal})
            .then((response) => {
                clearTimeout(timer);
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
                if (retries > 0) resolve(getXml(url, retries - 1, timeout));
                else {
                    console.error('Error fetching weather data', error, url);
                    reject(error);
                }
            });
    });
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

export function getObservationsForClosestStations(lat: number, lon: number, count: number): Promise<ObservationStation[]> {
    return new Promise((resolve, reject) => {
        getClosestStations(lat, lon, count).then((stations: ObservationStationLocation[]) => {
            const promises = stations.map((station: ObservationStationLocation) => {
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
    "vis", // visibility
    "wawa", // weather
]

function getObservationsForStation(station: ObservationStationLocation) {
    const url = baseUrl
        + '&fmisid=' + station.identifier
        + '&storedquery_id=fmi::observations::weather::timevaluepair'
        + '&parameters=' + observationStationParameters.join(',');
    return new Promise((resolve, reject) => {
        getXml(url, 1).then((json) => {
            const data = json['wfs:FeatureCollection']['wfs:member'];
            if (!data) {
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
                visibility: lastObservation(parseTimeSeriesObservation(data[10])).value,
                weather: lastObservation(parseTimeSeriesObservation(data[11])).value,
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
                if (Array.isArray(description)) {
                    // join all descriptions to one string
                    description = description.map((desc: any) => desc["@_xlink:title"]).join(" ");
                } else description = description["@_xlink:title"];
                if (description.toLowerCase().includes("sääasema"))
                    try {
                        return {
                            identifier: station['ef:EnvironmentalMonitoringFacility']['gml:identifier']["#text"],
                            name: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("name"))["#text"],
                            region: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("region"))["#text"],
                            country: station['ef:EnvironmentalMonitoringFacility']['gml:name'].find((name: any) => name["@_codeSpace"].endsWith("country"))["#text"],
                            lat: parseFloat(pos[0]),
                            lon: parseFloat(pos[1]),
                            distance: distanceBetweenCoordinates([lat, lon], [parseFloat(pos[0]), parseFloat(pos[1])])
                        } as ObservationStationLocation;
                    } catch (e) {
                        console.error(e);
                        return null;
                    }
            }).filter((station) => station !== null) as ObservationStationLocation[];
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

function calculateSunPosition(location: ForecastLocation) {
    const times = SunCalc.getTimes(new Date((new Date()).setHours(12, 0, 0, 0)), location.lat, location.lon)
    const isMidnightSun = isNaN(times.sunrise.getTime());
    const {start, end} = isMidnightSun ? calculateMidnightSun(location) : {start: new Date(), end: new Date()};
    return {
        sunrise: !isMidnightSun ? times.sunrise.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
        }) : start.toLocaleDateString("fi-FI", {day: "numeric", month: "numeric"}),
        sunset: !isMidnightSun ? times.sunset.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit"
        }) : end.toLocaleDateString("fi-FI", {day: "numeric", month: "numeric"}),
        lengthofday: `${Math.floor((times.sunset.getTime() - times.sunrise.getTime()) / 1000 / 60 / 60)}h ${Math.floor(((times.sunset.getTime() - times.sunrise.getTime()) / 1000 / 60) % 60)}min`,
    } as DayLength;
}

function calculateMidnightSun(location: ForecastLocation): { start: Date, end: Date } {
    const start = new Date((new Date()).setHours(12, 0, 0, 0));
    const end = new Date((new Date()).setHours(12, 0, 0, 0));
    while (isNaN(SunCalc.getTimes(start, location.lat, location.lon).sunrise.getTime())) start.setDate(start.getDate() - 1);
    while (isNaN(SunCalc.getTimes(end, location.lat, location.lon).sunset.getTime())) end.setDate(end.getDate() + 1);
    return {start, end};
}

export default {
    getLocation,
    getWeatherByLatLon,
    getWeatherNextHour
}
