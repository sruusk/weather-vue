import {getObservationsForClosestStations} from "@/weather";

self.onmessage = (event) => {
    const {lat, lon} = event.data;
    console.log("Observations worker received message", lat, lon);
    getObservationsForClosestStations(lat, lon, 4).then((stations) => {
        self.postMessage(stations);
    }).catch((error) => {
        console.error("Error in observations worker", error);
        self.postMessage([]);
    });
};
