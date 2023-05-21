<template>
  <div class="warnings">
    <div>{{ $t('home.warnings') }} - 5 {{ $t('home.days') }}</div>
    <div class="warning-list">
     <WarningItem
         class="warning-item"
         v-for="day in nextDays"
         @click="() => {
             // @ts-ignore
             $router.push({ name: 'warnings', params: { day: nextDays.indexOf(day) } })
         }"
         :severity="warnings[nextDays.indexOf(day)]?.severity"
         :key="day">
       {{ getShortDayName(day) }}
     </WarningItem>
   </div>
 </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useWeatherStore, useAlertsStore} from "@/stores";
import type {Warnings} from "@/types";
import WarningItem from "@/components/home/warnings/WarningItem.vue";

export default defineComponent({
 name: "WarningsBar.vue",
 components: {
   WarningItem
 },
  setup() {
    const weatherStore = useWeatherStore();
    const alertsStore = useAlertsStore();
    return {
      weatherStore,
      alertsStore
    }
  },
 data() {
   return {
     nextDays: this.nextFiveDays()
   }
 },
 computed: {
    warnings(): any {
      if( !this.weatherStore.currentWeather?.location ) return [] as unknown as Warnings;
      return this.alertsStore.getAlertsForLocation(this.weatherStore.currentWeather?.location)
    }
 },
 methods: {
   nextFiveDays() {
     let days = [];
     for (let i = 0; i < 5; i++) {
       days.push(new Date(new Date().setDate(new Date().getDate() + i)));
     }
     return days;
   },
   getShortDayName(date: Date) {
     return date.toLocaleDateString(this.$t('meta.localeString'), { weekday: 'short' });
   }
 }
})
</script>

<style scoped>
.warnings {
 color: white;
 font-size: 14px;
 font-weight: 400;
 margin: 9px 0 14px 0;
 display: flex;
 flex-direction: column;
 justify-content: center;
 align-items: center;
 contain: content;
}
.warning-list {
 margin: 0 10px;
 width: 100%;
 display: flex;
 flex-direction: row;
 justify-content: center;
 align-items: center;
}
.warning-item {
 text-transform: capitalize;
}
</style>
