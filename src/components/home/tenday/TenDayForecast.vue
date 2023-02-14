<template>
  <div class="main">
    <div class="header">
      <div class="title">{{ $t('home.tenDayForecast') }}</div>
      <div class="update-time">{{ $t('home.forecast') }} {{ $t('home.updated') }} {{ updateTime }}</div>
    </div>
    <TenDaySlider
        :weather="weather"
        :selected-day="selectedDay"
        :go-to-day="goToDay"
        :get-days-from-weather="getDaysFromWeather"
        :get-weather-for-day="getWeatherForDay"
        :get-weather-for-hour="getWeatherForHour" />
    <TenDayDetailed
        :weather="weather"
        :selected-day="selectedDay"
        :go-to-day="goToDay"
        :get-weather-for-hour="getWeatherForHour"
        :get-weather-for-day="getWeatherForDay"
        :get-days-from-weather="getDaysFromWeather" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import TenDaySlider from "@/components/home/tenday/TenDaySlider.vue";
import TenDayDetailed from "@/components/home/tenday/TenDayDetailed.vue";
import type {HourWeather, Weather} from "@/types";

export default defineComponent({
  name: "TenDayForecast.vue",
  components: {
    TenDaySlider,
    TenDayDetailed
  },
  props: {
    weather: {
      type: Object as () => Weather,
      required: true,
    },
  },
  data() {
    return {
      selectedDay: new Date(),
    }
  },
  computed: {
    updateTime() { // TODO: Get actual update time
      return new Date().toLocaleString("fi-FI", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    }
  },
  methods: {
    goToDay(day: Date) {
      this.selectedDay = day;
    },
    getWeatherForDay(day: Date) {
      const weather = {} as any;
      const startTime = new Date(day.toDateString())
      const endTime = new Date(day.toDateString()).setHours(23, 59, 59, 999)
      Object.entries(this.weather).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          weather[key] = [];
          value.forEach((item: any) => {
            if (item.time >= startTime && item.time <= endTime) weather[key].push(item);
          })
        } else weather[key] = value;
      })
      return weather as Weather;
    },
    getWeatherForHour(hour: number, weather: object) {
      const weatherForHour = {} as any;
      Object.entries(weather).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          let over = false;
          value.forEach((item: any) => {
            if (item.time.getHours() === hour){
              if(isNaN(item.value)) over = true;
              else weatherForHour[key] = item.value;
            } else if(over && !isNaN(item.value)) weatherForHour[key] = item.value;
            if(weatherForHour[key]) return;
          })
          if(!weatherForHour[key]) weatherForHour[key] = value[0].value;
        } else weatherForHour[key] = value;
      })
      return weatherForHour as HourWeather;
    },
    getDaysFromWeather() {
      const days = [] as Date[];
      const i = [] as string[];
      this.weather.temperature.forEach((item: any) => {
        if(!i.includes(item.time.toDateString())) {
          days.push(new Date(item.time.toDateString()));
          i.push(item.time.toDateString());
        }
      })
      days.pop();
      return days;
    },
  }
})
</script>

<style scoped>
.main {
  height: 430px;
  overflow: hidden;
  background-color: #111a2d;
}
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  height: 45px;
  padding: 0 10px;
}
.title {
  font-size: 14px;
}
.update-time {
  font-size: 12px;
  color: #a0a0a0;
}
</style>
