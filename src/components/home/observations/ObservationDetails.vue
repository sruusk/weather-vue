<template>
 <div class="measurement-list">
   <div class="measurement" v-for="(value, key) in measurements" :key="key">
     <div class="title">{{ key }}</div>
     <div class="value">{{ value }}</div>
   </div>
 </div>
</template>

<script lang="ts">
import type { ObservationStation } from "@/types";
import {defineComponent} from 'vue';

export default defineComponent({
  name: "ObservationDetails.vue",
  props: {
    station: {
      type: Object as () => ObservationStation,
      required: true
    }
  },
  computed: {
    measurements() {
      return this.filterUndefined({
        "Temperature": `${this.station.temperature} °C`,
        "Dew point": `${this.station.dewPoint} °C`,
        "Humidity": `${this.station.humidity} %`,
        "Wind": `${this.station.windSpeed} m/s`,
        "Wind gust": `${this.station.windGust} m/s`,
        "Pressure": `${this.station.pressure} hPa`,
        "Snow depth": `${this.station.snowDepth} cm`,
        "Cloudiness": `${this.cloudinessText} (${this.station.cloudiness}/8)`,
        "Visibility": this.formattedVisibility,
        "Precipitation rate": `${this.station.precipitation} mm/h`,
        "Weather": this.weatherText,
        "Cloud base": `${this.station.cloudBase} m`,
      });
    },
    formattedVisibility() {
      if (this.station.visibility === undefined) return undefined;
      if (this.station.visibility < 1000) {
        return `${this.station.visibility} m`;
      } else if(this.station.visibility >= 1000 && this.station.visibility < 5000) {
        return `${Math.round(this.station.visibility / 100) / 10} km`;
      } else return `over 50 km`;
    },
    cloudinessText() {
      const cloudiness = this.station.cloudiness;
      if(cloudiness === undefined) return undefined;

      if(cloudiness < 1) return 'sky clear';
      if(cloudiness === 1 || cloudiness === 2) return 'almost clear';
      if(cloudiness >= 3 && cloudiness <= 5) return 'partly cloudy';
      if(cloudiness === 6 || cloudiness === 7) return 'almost cloudy';
      if(cloudiness === 8) return 'cloudy';
      if(cloudiness === 9) return 'sky obscured';
      return '';
    },
    weatherText() {
      const code = this.station.weather;
      if(code === undefined) return undefined;

      if (code === 0 || (code >= 20 && code <= 29)) return 'clear';
      if (code === 4 || code === 5) return 'haze, smoke or dust';
      if (code === 10) return 'mist';
      if (code >= 30 && code <= 34) return 'fog';
      if (code === 40) return 'precipitation';
      if (code >= 50 && code <= 53) return 'drizzle'
      if (code === 60) return 'rain'
      if (code === 41) return 'light or moderate precipitation'
      if (code === 42) return 'heavy precipitation'
      if (code >= 54 && code <= 56) return 'freezing drizzle'
      if (code === 61) return 'light rain'
      if (code === 62) return 'moderate rain'
      if (code === 63) return 'heavy rain'
      if (code === 64) return 'light freezing rain'
      if (code === 65) return 'moderate freezing rain'
      if (code === 66) return 'heavy freezing rain'
      if (code === 67) return 'light sleet'
      if (code === 68) return 'moderate sleet'
      if (code === 70) return 'snow'
      if (code === 71) return 'light snow'
      if (code === 72) return 'moderate snow'
      if (code === 73) return 'heavy snow'
      if (code >= 74 && code <= 76) return 'ice pellets'
      if (code === 78) return 'ice crystals'
      if (code === 80) return 'showers or intermittent precipitation'
      if (code === 81) return 'light rain showers'
      if (code === 82) return 'moderate rain showers'
      if (code === 83) return 'heavy rain showers'
      if (code === 84) return 'violent rain showers'
      if (code === 85) return 'light snow showers'
      if (code === 86) return 'moderate snow showers'
      if (code === 87) return 'heavy snow showers'
      if (code === 89) return 'hail showers'

      return '';
    }
  },
  methods: {
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
    filterUndefined(obj: any) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined && typeof value === "string" && !value.includes("undefined")) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
    },
  }
})
</script>

<style scoped>
.measurement-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;
}
.measurement {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2px 10px;
  width: 100%;
  font-size: 13px;
  font-weight: 300;
}
</style>
