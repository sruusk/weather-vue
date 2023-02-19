<template>
  <div class="slider"
       ref="slider"
       @scroll="onScroll"
       :class="isMobile ? 'mobile' : 'desktop'">
    <DayItem
        v-for="day in days"
        :key="day.getTime()"
        :weather="getWeatherForDay(day)"
        :day="day"
        :getWeatherForHour="getWeatherForHour"
        @day-position="addDayPosition" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Weather } from '@/types';
import DayItem from "@/components/home/tenday/DayItem.vue";

export default defineComponent({
  name: "TenDayDetailed.vue",
  setup() {
    const slider = ref(null)
    return {
      slider
    }
  },
  components: {
    DayItem
  },
  props: {
    weather: {
      type: Object as () => Weather,
      required: true
    },
    selectedDay: {
      type: Date,
      required: true
    },
    goToDay: {
      type: Function,
      required: true
    },
    getWeatherForDay: {
      type: Function,
      required: true
    },
    getWeatherForHour: {
      type: Function,
      required: true
    },
    getDaysFromWeather: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      days: [] as Date[],
      dayPositions: {} as { [key: number]: Date },
      ignoreNext: false,
      scrolling: false
    }
  },
  created() {
    this.days = this.getDaysFromWeather();
  },
  watch: {
    weather: {
      handler: function () {
        this.days = this.getDaysFromWeather();
      },
      deep: true
    },
    selectedDay: {
      handler: function () {
        if(this.ignoreNext) {
          this.ignoreNext = false;
          return;
        }
        this.scrolling = true;
        // @ts-ignore
        this.slider?.querySelector(`#ten-day-detailed-${this.selectedDay.getDate()}`)
            .scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      },
      deep: true
    }
  },
  computed: {
    isMobile() {
      // @ts-ignore
      return this.$isMobile();
    }
  },
  methods: {
    onScroll() {
      // @ts-ignore
      const scrollLeft = this.slider?.scrollLeft;
      const entries = Object.entries(this.dayPositions).reverse();
      for (const [position, date] of entries) {
        if (scrollLeft >= parseInt(position) - 20) {
          if(!this.scrolling && this.selectedDay.getDate() !== date.getDate()) {
            this.ignoreNext = true;
            this.goToDay(date);
          } else if(this.scrolling && this.selectedDay.getDate() === date.getDate()) {
            this.scrolling = false;
            // @ts-ignore
          } else if(this.scrolling && this.slider?.scrollWidth - this.slider?.clientWidth === scrollLeft) {
            this.scrolling = false;
          }
          break;
        }
      }
    },
    addDayPosition(dayPosition: { date: Date, position: number }) {
      this.dayPositions[dayPosition.position] = dayPosition.date;
    }
  },
})
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.slider {
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
}
.mobile {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.mobile::-webkit-scrollbar {
  display: none;
}
</style>
