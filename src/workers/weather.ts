import Weather from '@/weather'

self.onmessage = (event) => {
    const { lat, lon } = event.data
    console.log("Weather worker received message", lat, lon);
    Weather.getWeatherByLatLon(lat, lon).then((weather) => {
        self.postMessage(weather)
    })
}
