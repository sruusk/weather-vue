import Weather from '@/weather';

self.onmessage = (event) => {
    const {lat, lon, type} = event.data;
    console.log("Weather worker received message", lat, lon, type || 'default');
    switch (type) {
        case "nextHour":
            Weather.getWeatherNextHour(lat, lon).then((weather) => {
                self.postMessage({
                    time: `${weather.temperature[0].time.getHours()}:00`,
                    temperature: weather.temperature[0].value,
                    windDirection: weather.windDirection[0].value,
                    windSpeed: weather.windSpeed[0].value,
                    windGust: weather.windGust[0].value,
                    weatherSymbol: weather.weatherSymbol[0].value,
                    precipitation: weather.precipitation[0].value,
                    probabilityOfPrecipitation: weather.probabilityOfPrecipitation ? weather.probabilityOfPrecipitation[0].value : undefined,
                    humidity: weather.humidity[0].value,
                    feelsLike: weather.feelsLike[0].value,
                });
            });
            break;
        default:
            Weather.getWeatherByLatLon(lat, lon).then((weather) => {
                self.postMessage(weather);
            }).catch((error) => {
                console.error("Weather worker error", error);
                Weather.getWeatherByLatLon(lat, lon).then((weather) => {
                    self.postMessage(weather);
                }).catch((error) => {
                    console.error("Weather worker error", error);
                    self.postMessage({});
                });
            });
            break;
    }
};
