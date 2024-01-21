<template>
  <div :id="'ten-day-detailed-' + day.getDate()"
       ref="dayItem"
       class="main">
    <div class="header">{{ formattedDate }}</div>
    <div class="weather">
      <div v-for="hour in hours" :key="hour.getTime()" :class="`hour-${hour.getHours()}`">
        <div class="hour">
          {{ hour.toLocaleTimeString($t('meta.localeString'), {hour: 'numeric', minute: 'numeric', hour12: false}) }}
        </div>
        <WeatherColumn :weather="weatherStore.getWeather(day, hour.getHours())"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useSettingsStore, useWeatherStore} from "@/stores";
import type {TimeSeriesObservation, Weather} from '@/types';
import WeatherColumn from "@/components/home/hourly/WeatherColumn.vue";

export default defineComponent({
  name: "DayItem.vue",
  components: {
    WeatherColumn
  },
  props: {
    weather: {
      type: Object as () => Weather,
      required: true
    },
    day: {
      type: Date,
      required: true
    },
  },
  setup() {
    const dayItem = ref(null)
    const weatherStore = useWeatherStore();
    const settingsStore = useSettingsStore();
    return {
      dayItem,
      weatherStore,
      settingsStore
    }
  },
  data() {
    return {}
  },
  computed: {
    formattedDate() {
      if (this.hours.length <= 1) return this.day.toLocaleDateString(this.$t('meta.localeString'), {weekday: 'short'});
      return this.day.toLocaleDateString(this.$t('meta.localeString'), {weekday: 'long'})
        + ' '
        + this.day.toLocaleDateString('fi-FI', {day: 'numeric', month: 'numeric'});
    },
    hours() {
      return this.weather.temperature.map((hour: TimeSeriesObservation) => {
        if (hour.time.getHours() % this.settingsStore.forecastInterval === 0) return hour.time;
        else return undefined;
      }).filter(a => a !== undefined) as Date[];
    }
  }
})
</script>

<style scoped>
.main {
  contain: content;
}

.header {
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  background-color: var(--backgroundDark);
  padding: 5px 0 0 10px;
  height: 20px;
  text-transform: capitalize;
}

.weather {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--backgroundDarker);
  contain: content;
}

.hour {
  font-size: 12px;
  font-weight: normal;
  margin: 0;
  padding: 0 0 3px 10px;
  height: 20px;
  background-color: var(--backgroundDark);
}
</style>
