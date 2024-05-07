<template>
  <div class="slider">
    <div v-for="day in days"
         :id="'ten-day-slider-' + day.getDate()"
         :key="day.getTime()"
         :class="day.toDateString() === selectedDay.toDateString() ? 'selected' : ''"
         class="day"
         @click="goToDay(day)"
    >
      <div class="day-header">{{ getShortDayName(day) }}</div>
      <img :src="getWeatherIcon(day)" alt="Weather icon"/>
      <div class="day-temp">{{ tempPrefix(getDayTemp(day)) + Math.abs(getDayTemp(day)) }} °C</div>
      <div class="glance-bar-day">
        <div v-for="hour in getWeatherForDay(day)?.precipitation ?? []"
             :key="hour.time.getHours()"
             :style="{
             backgroundColor: getGlanceColour(hour.value),
             minWidth: `${getGlanceWidth(hour.time)}px`
           }"
             class="glance-bar-hour"
        />
      </div>
    </div>
  </div>
  <div class="glance-background"/>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useSettingsStore, useWeatherStore} from "@/stores";
import type {Weather} from "@/types";

export default defineComponent({
  name: "TenDaySlider.vue",
  props: {
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
  data() {
    return {
      left: 0,
    }
  },
  computed: {
    days() {
      return this.weatherStore.getDays();
    },
    hours() {
      return this.weatherStore.currentWeather?.precipitation.map(observation => observation.time) ?? [];
    }
  },
  methods: {
    getShortDayName(date: Date) {
      return date.toLocaleDateString(this.$t('meta.localeString'), {weekday: 'short'});
    },
    getDayWeather(date: Date) {
      let weatherForHour = this.weatherStore.getWeather(date, 15);
      if (isNaN(weatherForHour.temperature)) weatherForHour = this.weatherStore.getWeather(date, 18);
      return weatherForHour;
    },
    getWeatherIcon(date: Date) {
      let weatherForHour = this.getDayWeather(date);
      if(isNaN(weatherForHour.weatherSymbol)) return `/symbols/error.svg`;
      return `/symbols/${this.settingsStore.useAnimations ? 'animated' : 'static'}/${weatherForHour.weatherSymbol}.svg`;
    },
    getDayTemp(date: Date) {
      const weatherForHour = this.getDayWeather(date);
      return Math.round(weatherForHour.temperature);
    },
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
    getGlanceColour(precipitation: number): string {
      if (precipitation < 0.1) return 'var(--backgroundLight)';
      if (precipitation < 0.2) return '#0a9afd';
      if (precipitation < 0.5) return '#05cba9';
      if (precipitation < 1) return '#8be414';
      if (precipitation < 2) return '#eeee14';
      if (precipitation < 4) return '#f7a314';
      if (precipitation < 6) return '#fd4f3c';
      if (precipitation > 6) return '#f73a14';
      return 'var(--backgroundDarkest)';
    },
    getWeatherForDay(day: Date): Weather {
      return this.weatherStore.getWeather(day);
    },
    getGlanceWidth(hour: Date): number {
      const index = this.hours.indexOf(hour);
      const nextHour = this.hours[index + 1];
      if (!nextHour || !hour) return 2.5;
      return Math.max(((nextHour.getTime() - hour.getTime()) / (1000 * 60 * 60)) * 2.5, 2.5); // 2.5px per hour
    }
  }
})
</script>

<style scoped>
.slider {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--backgroundDark);
  box-shadow: inset 0 20px 10px -10px rgba(0, 0, 0, 0.2);
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.slider::-webkit-scrollbar {
  display: none;
}

.day {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 60px;
  min-width: 60px;
  cursor: pointer;
}

.day img {
  margin-top: -5px;
  width: 55px;
  height: 55px;
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

.glance-bar-day {
  background-color: var(--background);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  height: 9px;
  width: 60px;
  min-width: 60px;
}

.day:nth-of-type(1) .glance-bar-day {
  justify-content: flex-end;
}

.glance-bar-hour {
  height: 9px;
  width: calc(100% / 24);
}

.glance-background {
  width: 100%;
  height: 9px;
  background-color: var(--background);
  z-index: -1;
  margin-top: -9px;
}
</style>
