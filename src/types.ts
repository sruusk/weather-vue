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
    probabilityOfPrecipitation: TimeSeriesObservation[] | undefined,
    weatherSymbol: TimeSeriesObservation[],
    feelsLike: TimeSeriesObservation[],
    location: ForecastLocation,
    updated: Date,
}
export type OpenWeather = {
    humidity: TimeSeriesObservation[],
    temperature: TimeSeriesObservation[],
    windDirection: TimeSeriesObservation[],
    windSpeed: TimeSeriesObservation[],
    windGust: TimeSeriesObservation[],
    precipitation: TimeSeriesObservation[],
    probabilityOfPrecipitation: TimeSeriesObservation[],
    weatherSymbol: TimeSeriesObservation[],
    feelsLike: TimeSeriesObservation[]
}
export type HourWeather = {
    time: string | Date | undefined,
    humidity: number,
    temperature: number,
    windDirection: number,
    windSpeed: number,
    windGust: number,
    precipitation: number,
    probabilityOfPrecipitation: number | undefined,
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

export type Warnings = {
    0: Warning,
    1: Warning,
    2: Warning,
    3: Warning,
    4: Warning
}

export type FmiAlertData = {
    severity: string,
    polygons: [number, number][][],
    onset: Date,
    expires: Date,
    event: string,
    headline: string,
    description: string,
}

export type FmiAlerts = {
    fi: FmiAlertData[],
    sv: FmiAlertData[],
    en: FmiAlertData[],
}

export type Warning = {
    severity: "Minor" | "Moderate" | "Severe" | "Extreme"
}

export type Theme = {
    name: string,
    colours: {
        background: string,
        backgroundDark: string,
        backgroundDarker: string,
        backgroundDarkest: string,
        backgroundLight: string,
        backgroundLighter: string,
        backgroundLightest: string,
        backgroundGradient: string,
        backgroundMediumLight: string,
        backgroundObservations: string,
        backgroundSettingsItem: string,
        selectedLight: string,
    },
    invertRadar: boolean,
}


