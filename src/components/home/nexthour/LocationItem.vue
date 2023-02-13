<template>
  <div v-if="weather && Object.keys(weather).length">
    <h2>{{ weather.location.name }}, {{ weather.location.region }}</h2>
    <div class="weather">
      <img :src="weatherIcon" alt="weather icon" />
      <div class="temperature">
        <span class="temp">{{ tempPrefix(weather.temperature) }}</span>
        <span class="temp">{{ Math.round(Math.abs(weather.temperature)) }}</span>
        <span class="unit">°C</span>
      </div>
    </div>
    <div class="details">
      <div class="feelslike-row">
        <div class="time">
          <ShareButton>{{ $t('home.share') }}</ShareButton>
          <ClockIcon class="timeIcon" />
          <span class="time-value">{{ weather.time }}</span>
        </div>
        <FeelsLike :temperature="weather.feelsLike" />
      </div>
    </div>
    <CurrentWeatherBar :weather="weather" />
  </div>
</template>

<script lang="ts">
import type { HourWeather } from "@/types";
import { defineComponent } from 'vue';
import ClockIcon from "@/components/icons/ClockIcon.vue";
import ShareButton from "@/components/home/nexthour/ShareButton.vue";
import FeelsLike from "@/components/home/nexthour/FeelsLike.vue";
import CurrentWeatherBar from "@/components/home/nexthour/CurrentWeatherBar.vue";

export default defineComponent({
  name: "LocationItem.vue",
  props: {
    weather: {
      type: Object as () => HourWeather,
      required: true,
    },
  },
  components: {
    ClockIcon,
    ShareButton,
    FeelsLike,
    CurrentWeatherBar,
  },
  computed: {
    weatherIcon() {
      return `/symbols/${this.weather.weatherSymbol}.svg`;
    },
  },
  methods: {
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    }
  }
})
</script>

<style scoped>
h2 {
  font-size: 1.1rem;
  color: white;
  font-weight: 400;
  text-align: center;
  margin: 0;
  padding: 0;
  width: 100%;
}
.weather {
  display: flex;
  flex-direction: row;
  color: white;
  align-items: center;
  justify-content: space-between;
  margin: 15px 10px 0 10px;
  padding: 0;
  height: 100px;
}
.weather img {
  width: 150px;
  height: 150px;
  margin: 10px 0 0 20px;
}
.temperature {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
  padding: 0;
}
.temp {
  font-size: 5rem;
  font-weight: 200;
  text-align: center;
  margin: 0;
  padding: 0;
  line-height: 5rem;
}
.unit {
  font-size: 1.2rem;
  font-weight: 200;
  color: #a3b4dc;
  text-align: center;
  margin: 10px 0 0 10px;
  padding: 0;
}
.details {
  margin: 10px 10px 0 10px;
}
.feelslike-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}
.time {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 0 5px 0;
  padding: 0;
}
.timeIcon {
  width: 16px;
  height: 16px;
  margin: 0 5px 0 20px;
}
.time-value {
  font-size: 14px;
  font-weight: 400;
  color: #a3b4dc;
  text-align: center;
  margin: 0;
  padding: 0;
}
</style>
