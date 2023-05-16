<template>
  <div class="main">
    <div class="day"
         v-for="day in days"
         :key="day.getTime()"
          @click="goToDay(day)"
         :id="'ten-day-slider-' + day.getDate()"
         :class="day.toDateString() === selectedDay.toDateString() ? 'selected' : ''"
    >
      <div class="day-header">{{ getShortDayName(day) }}</div>
      <img :src="getWeatherIcon(day)" alt="Weather icon" />
      <div class="day-temp">{{ tempPrefix(getDayTemp(day)) + getDayTemp(day) }} °C</div>
    </div>
  </div>
  <div class="glance-bar"></div>
</template>

<script lang="ts">
import type {Weather} from "@/types";
import {defineComponent} from 'vue';
import {useWeatherStore, useSettingsStore} from "@/stores";
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

export default defineComponent({
  name: "TenDaySlider.vue",
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation
  },
  props: {
    weather: {
      type: Object as () => Weather,
      required: true
    },
    goToDay: {
      type: Function,
      required: true
    },
    selectedDay: {
      type: Date,
      required: true
    }
  },
  setup() {
    const weatherStore = useWeatherStore();
    const settingsStore = useSettingsStore();
    return {
      weatherStore,
      settingsStore
    }
  },
  data () {
    return {

    }
  },
  computed: {
    days() {
      return this.weatherStore.getDays();
    }
  },
  methods: {
    getShortDayName(date: Date) {
      return date.toLocaleDateString(this.$t('meta.localeString'), { weekday: 'short' });
    },
    getWeatherIcon(date: Date) {
      const weatherForHour = this.weatherStore.getWeather(date, 15);
      if(isNaN(weatherForHour.weatherSymbol)) return `/symbols/error.svg`;
      return `/symbols/${this.settingsStore.useAnimations ? 'animated' : 'static'}/${weatherForHour.weatherSymbol}.svg`;
    },
    getDayTemp(date: Date) {
      const weatherForHour = this.weatherStore.getWeather(date, 15);
      return Math.round(weatherForHour.temperature);
    },
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
  }
})
</script>

<style scoped>
.main {
  display: inline-grid;
  grid-template-columns: repeat(10, 1fr);
  width: 100%;
  overflow-x: auto;
  background-color: var(--backgroundLighter);
  box-shadow: inset 0 20px 10px -10px rgba(0, 0, 0, 0.2);
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.main::-webkit-scrollbar {
  display: none;
}
.day {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 60px;
  height: 95px;
  cursor: pointer;
}
.day img {
  margin-top: -5px;
  width: 50px;
  height: 50px;
}
.day-header {
  font-size: 13px;
  font-weight: 400;
  color: #fff;
  margin-top: 7px;
  text-transform: capitalize;
}
.day-temp {
  font-size: 12px;
  color: #fff;
  margin-top: -5px;
  margin-bottom: 10px;
}
/*noinspection CssUnusedSymbol*/
.selected {
  background-color: var(--selectedLight);
}
.glance-bar {
  background-color: var(--backgroundLight);
  height: 9px;
  width: 100%;
}
</style>
