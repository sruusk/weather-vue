<template>
  <div class="main">
    <div class="header">
      <div class="title">{{ $t('home.tenDayForecast') }}</div>
      <div class="update-time">{{ $t('home.forecast') }} {{ $t('home.updated') }} {{ updateTime }}</div>
    </div>
    <TenDaySlider
      :go-to-day="goToDay"
      :selected-day="displayedDay"
    />
    <TenDayDetailed
      :go-to-day="(date: Date) => { displayedDay = date; }"
      :selected-day="selectedDay"
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import TenDaySlider from "@/components/home/hourly/TenDaySlider.vue";
import TenDayDetailed from "@/components/home/hourly/TenDayDetailed.vue";
import {useWeatherStore} from "@/stores";

export default defineComponent({
  name: "TenDayForecast.vue",
  components: {
    TenDaySlider,
    TenDayDetailed
  },
  setup() {
    const weatherStore = useWeatherStore();
    return {
      weatherStore,
    };
  },
  data() {
    return {
      selectedDay: new Date() as Date | null,  // This is the day when the detailed view is to be focused
      displayedDay: new Date(), // This is the day that shows as selected in the day selector
    }
  },
  computed: {
    updateTime() {
      return this.weatherStore.currentWeather?.updated?.toLocaleString("fi-FI", {
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
      if (this.selectedDay === day) {
        this.selectedDay = null;
        setTimeout(() => {
          this.selectedDay = day;
        }, 20);
      } else this.selectedDay = day;
    },
  }
})
</script>

<style scoped>
.main {
  background-color: var(--backgroundDarkest);
  contain: content;
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
