export type TimeSeriesObservation = {
    time: Date,
    value: number,
}
export type ForecastLocation = {
    name: string,
    identifier: string,
    region: string,
    country: string,
    lat: number,
    lon: number,
}
export type Weather = {
    humidity: TimeSeriesObservation[],
    temperature: TimeSeriesObservation[],
    windDirection: TimeSeriesObservation[],
    windSpeed: TimeSeriesObservation[],
    windGust: TimeSeriesObservation[],
    precipitation: TimeSeriesObservation[],
    weatherSymbol: TimeSeriesObservation[],
    feelsLike: TimeSeriesObservation[],
    location: ForecastLocation,
}
export type HourWeather = {
    time: string | Date | undefined,
    humidity: number,
    temperature: number,
    windDirection: number,
    windSpeed: number,
    windGust: number,
    precipitation: number,
    weatherSymbol: number,
    feelsLike: number,
    location: ForecastLocation,
}
export type ObservationStationLocation = {
    name: string,
    identifier: string,
    region: string,
    country: string,
    lat: number,
    lon: number,
    distance: number,
}
export type ObservationStation = {
    location: ObservationStationLocation,
    time: Date,
    temperature: number,
    humidity: number,
    dewPoint: number,
    snowDepth: number | undefined,
    pressure: number | undefined,
    cloudiness: number | undefined,
    visibility: number | undefined,
    precipitation: number | undefined,
    cloudBase: number | undefined,
    windDirection: number | undefined,
    windSpeed: number | undefined,
    windGust: number | undefined,
    weather: number | undefined,
    temperatureHistory: TimeSeriesObservation[],
    precipitationHistory: TimeSeriesObservation[] | undefined,
}

export type DayLength = {
    sunrise: string,
    sunset: string,
    lengthofday: string
}

export type Warning = {
    severity: string
}


