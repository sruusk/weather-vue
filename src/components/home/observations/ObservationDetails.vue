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
      const measurements = {} as any;
      measurements[this.$t('home.temperature')] = `${this.station.temperature} °C`;
      measurements[this.$t('home.dewPoint')] = `${this.station.dewPoint} °C`;
      measurements[this.$t('home.humidity')] = `${this.station.humidity} %`;
      measurements[this.$t('home.wind')] = `${this.station.windSpeed} m/s`;
      measurements[this.$t('home.windGust')] = `${this.station.windGust} m/s`;
      measurements[this.$t('home.pressure')] = `${this.station.pressure} hPa`;
      measurements[this.$t('home.snowDepth')] = `${this.station.snowDepth} cm`;
      measurements[this.$t('home.cloudiness')] = `${this.cloudinessText} (${this.station.cloudiness}/8)`;
      measurements[this.$t('home.visibility')] = this.formattedVisibility;
      measurements[this.$t('home.precipitationRate')] = `${this.station.precipitation} mm/h`;
      measurements[this.$t('home.weather')] = this.weatherText;
      measurements[this.$t('home.cloudBase')] = `${this.station.cloudBase} m`;
      return this.filterUndefined(measurements);
    },
    formattedVisibility() {
      if (this.station.visibility === undefined) return undefined;
      if (this.station.visibility < 1000) {
        return `${this.station.visibility} m`;
      } else if(this.station.visibility >= 1000 && this.station.visibility < 5000) {
        return `${Math.round(this.station.visibility / 100) / 10} km`;
      } else return `${this.$t('home.over')} 50 km`;
    },
    cloudinessText() {
      const cloudiness = this.station.cloudiness;
      if(cloudiness === undefined) return undefined;

      if(cloudiness < 1) return this.$t('home.cloudinessText.clear');
      if(cloudiness === 1 || cloudiness === 2) return this.$t('home.cloudinessText.almostClear');
      if(cloudiness >= 3 && cloudiness <= 5) return this.$t('home.cloudinessText.partlyCloudy');
      if(cloudiness === 6 || cloudiness === 7) return this.$t('home.cloudinessText.almostCloudy');
      if(cloudiness === 8) return this.$t('home.cloudinessText.cloudy');
      if(cloudiness === 9) return this.$t('home.cloudinessText.skyObscured');
      return '';
    },
    weatherText() {
      const code = this.station.weather;
      if(code === undefined) return undefined;

      if (code === 0 || (code >= 20 && code <= 29)) return this.$t('home.weatherText.clear');
      if (code === 4 || code === 5) return this.$t('home.weatherText.hazeSmokeDusk');
      if (code === 10) return this.$t('home.weatherText.mist');
      if (code >= 30 && code <= 34) return this.$t('home.weatherText.fog');
      if (code === 40) return this.$t('home.weatherText.precipitation');
      if (code >= 50 && code <= 53) return this.$t('home.weatherText.drizzle');
      if (code === 60) return this.$t('home.weatherText.rain');
      if (code === 41) return this.$t('home.weatherText.lightPrecipitation');
      if (code === 42) return this.$t('home.weatherText.heavyPrecipitation');
      if (code >= 54 && code <= 56) return this.$t('home.weatherText.freezingDrizzle');
      if (code === 61) return this.$t('home.weatherText.lightRain');
      if (code === 62) return this.$t('home.weatherText.moderateRain');
      if (code === 63) return this.$t('home.weatherText.heavyRain');
      if (code === 64) return this.$t('home.weatherText.lightFreezingRain');
      if (code === 65) return this.$t('home.weatherText.moderateFreezingRain');
      if (code === 66) return this.$t('home.weatherText.heavyFreezingRain');
      if (code === 67) return this.$t('home.weatherText.lightSleet');
      if (code === 68) return this.$t('home.weatherText.moderateSleet');
      if (code === 70) return this.$t('home.weatherText.snow');
      if (code === 71) return this.$t('home.weatherText.lightSnow');
      if (code === 72) return this.$t('home.weatherText.moderateSnow');
      if (code === 73) return this.$t('home.weatherText.heavySnow');
      if (code >= 74 && code <= 76) return this.$t('home.weatherText.icePellets');
      if (code === 78) return this.$t('home.weatherText.iceCrystals');
      if (code === 80) return this.$t('home.weatherText.showers');
      if (code === 81) return this.$t('home.weatherText.lightShowers');
      if (code === 82) return this.$t('home.weatherText.moderateShowers');
      if (code === 83) return this.$t('home.weatherText.heavyShowers');
      if (code === 84) return this.$t('home.weatherText.violetShowers');
      if (code === 85) return this.$t('home.weatherText.lightSnowShowers');
      if (code === 86) return this.$t('home.weatherText.moderateSnowShowers');
      if (code === 87) return this.$t('home.weatherText.heavySnowShowers');
      if (code === 89) return this.$t('home.weatherText.hailShowers');

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
