<template>
  <div class="weather-column">
    <div class="weather-column__icon">
      <img :src="getIconUrl(weather.weatherSymbol)" alt=""/>
    </div>
    <div class="weather-column__temp">
      {{ tempPrefix(weather.temperature) }}{{ Math.round(Math.abs(weather.temperature)) }} °C
    </div>
    <div class="weather-column__feelslike">
      <FeelslikeIcon/>
      <div class="weather-column__feelslike-value">
        {{ tempPrefix(weather.feelsLike) }}{{ Math.round(Math.abs(weather.feelsLike)) }}°
      </div>
    </div>
    <WindIndicator
      :negative="false"
      :wind-direction="weather.windDirection"
      :wind-speed="weather.windSpeed"/>
    <RainItem
      :negative="false"
      :rain-amount="weather.precipitation"
      :rain-probability="weather.probabilityOfPrecipitation !== undefined ? weather.probabilityOfPrecipitation : -1"
      class="weather-column__rain"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import type {HourWeather} from '@/types';
import FeelslikeIcon from "@/components/icons/feelslike/FeelslikeIcon.vue";
import WindIndicator from "@/components/home/WindIndicator.vue";
import RainItem from "@/components/home/RainItem.vue";

export default defineComponent({
  name: "WeatherColumn.vue",
  components: {
    FeelslikeIcon,
    WindIndicator,
    RainItem,
  },
  props: {
    weather: {
      type: Object as () => HourWeather,
      required: true
    },
  },
  methods: {
    getIconUrl(icon: number) {
      if (!icon) return "/symbols/error.svg"
      return `/symbols/static/${icon}.svg`;
    },
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
  },
})
</script>

<style scoped>
.weather-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 210px;
  border-right: var(--backgroundDark) 1px solid;
  border-bottom: var(--backgroundDark) 2px solid;
  font-size: 12px;
  contain: paint;
}

.weather-column__icon {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: -5px;
}

.weather-column__icon img {
  width: 50px;
  height: 50px;
}

.weather-column__feelslike {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.weather-column__feelslike svg {
  width: 35px;
  height: 35px;
}

.weather-column__feelslike-value {
  margin-top: -16px;
  color: black;
}

.weather-column__rain {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 0;
}
</style>
