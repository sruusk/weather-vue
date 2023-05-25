<template>
  <div class="slider"
       ref="slider"
       @scroll="onScroll"
       :class="isMobile ? 'mobile' : 'desktop'">
    <DayItem
        v-for="day in days"
        :key="day.getTime()"
        :weather="weatherStore.getWeather(day)"
        :day="day" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {useWeatherStore} from "@/stores";
import DayItem from "@/components/home/tenday/DayItem.vue";

export default defineComponent({
  name: "TenDayDetailed.vue",
  setup() {
    const slider = ref(null)
    const weatherStore = useWeatherStore();
    return {
      slider,
      weatherStore
    }
  },
  components: {
    DayItem
  },
  props: {
    selectedDay: {
      type: Date as unknown as () => Date | null,
      required: true
    },
    goToDay: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      dayPositions: {} as { [key: number]: Date },
      displayedDay: this.selectedDay,
      scrollTimer: null as null | ReturnType<typeof setTimeout>
    }
  },
  created() {
    this.$nextTick(() => {
      this.getDayPositions();
    });
  },
  watch: {
    selectedDay: {
      handler: function () {
        if(!this.selectedDay) return;
        // @ts-ignore
        this.slider?.querySelector(`#ten-day-detailed-${this.selectedDay.getDate()}`)
            .scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      },
      deep: true
    },
    "weatherStore.currentWeather": function () {
      this.$nextTick(() => {
        this.getDayPositions();
        this.goToDay(this.days?.[0]);
      });
    }
  },
  computed: {
    isMobile() {
      // @ts-ignore
      return this.$isMobile();
    },
    days() {
      return this.weatherStore.getDays();
    }
  },
  methods: {
    onScroll() {
      // @ts-ignore
      if(this.scrollTimer) clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
          if(!this.displayedDay) return;
          // @ts-ignore
          const scrollLeft = this.slider?.scrollLeft;
          const entries = Object.entries(this.dayPositions).reverse();
          for (const [position, date] of entries) {
              if (scrollLeft >= parseInt(position) - 20) {
                  if(this.displayedDay.getDate() !== date.getDate()) {
                      this.goToDay(date);
                      this.displayedDay = date;
                  }
                  break;
              }
          }
      }, 20);
    },
    getDayPositions() {
      // @ts-ignore
      const children = this.slider?.children;
      for(let i = 0; i < children.length; i++) {
          const child = children[i];
          // @ts-ignore
          const position = child.offsetLeft;
          const date = this.days?.[i];
          if(!date) continue;
          this.dayPositions[position] = date;
      }
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
