<template>
  <div class="main"
       ref="dayItem"
       :id="'ten-day-detailed-' + day.getDate()">
    <div class="header">{{ formattedDate }}</div>
    <div class="weather">
      <div v-for="hour in hours" :key="hour.getTime()">
        <div class="hour">{{ hour.toLocaleTimeString($t('meta.localeString'), { hour: 'numeric', minute: 'numeric', hour12: false }) }}</div>
        <WeatherColumn :weather="getWeatherForHour(hour.getHours(), weather)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Weather, TimeSeriesObservation } from '@/types';
import WeatherColumn from "@/components/home/tenday/WeatherColumn.vue";

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
    getWeatherForHour: {
      type: Function,
      required: true
    },
  },
  emits : ['dayPosition'],
  setup() {
    const dayItem = ref(null)
    return {
      dayItem
    }
  },
  data() {
    return {

    }
  },
  mounted() {
    // @ts-ignore
    this.$emit('dayPosition', { date: this.day, position: this.dayItem.offsetLeft });
  },
  computed: {
    formattedDate() {
      if(this.hours.length <= 1) return this.day.toLocaleDateString(this.$t('meta.localeString'), { weekday: 'short' });
      return this.day.toLocaleDateString(this.$t('meta.localeString'), { weekday: 'long' })
          + ' '
          + this.day.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' });
      },
      hours() {
      return this.weather.temperature.map((hour: TimeSeriesObservation) => {
        return hour.time;
      });
    }
  }
})
</script>

<style scoped>
.header {
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  background-color: #1d2e5d;
  padding: 5px 0 0 10px;
  height: 20px;
  text-transform: capitalize;
}
.weather {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #111a2e;
}
.hour {
  font-size: 12px;
  font-weight: normal;
  margin: 0;
  padding: 0 0 3px 10px;
  height: 20px;
  background-color: #1d2e5d;
}
</style>
