<template>
  <div id="main">
    <div class="side">
      <RainItem
          :rain-amount="weather.precipitation"
          :rain-probability="weather.humidity"
          :negative="true" />
    </div>
    <div class="center">
      <SunIcon class="sun-icon" />
      <span>{{ dayLength }}</span>
    </div>
    <div class="side">
      <WindIndicator
          :windDirection="weather.windDirection"
          :windSpeed="weather.windSpeed"
          :negative="true" />
    </div>
  </div>
</template>

<script lang="ts">
import type { HourWeather } from "@/types";
import {defineComponent} from 'vue';
import { getDayLength } from "@/weather";
import WindIndicator from "@/components/home/WindIndicator.vue";
import RainItem from "@/components/home/RainItem.vue";
import SunIcon from "@/components/icons/feelslike/SunIcon.vue";

export default defineComponent({
  name: "CurrentWeatherBar.vue",
  props: {
    weather: {
      type: Object as () => HourWeather,
      required: true,
    },
  },
  components: {
    WindIndicator,
    RainItem,
    SunIcon
  },
  data() {
    return {
      dayLength: "Loading..."
    }
  },
  created() {
    const dayLength = getDayLength(this.weather.location);
    this.dayLength = `${dayLength.sunrise} - ${dayLength.sunset}`
  }
})
</script>

<style scoped>
#main {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: 58px;
}
.side {
  background-color: #00000025;
  width: 80px;
  display: flex;
  font-size: 14px;
  justify-content: center;
  align-items: center;
}
.center {
  background-color: #00000025;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 15px;
  color: white;
  font-size: 14px;
}
.sun-icon {
  width: 35px;
  height: 35px;
  margin: 0 5px;
}
#main div {
  margin: 0 1px 0 0;
  height: 100%;
}
</style>
