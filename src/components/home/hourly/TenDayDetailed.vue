<template>
  <div ref="slider"
       :class="isMobile ? 'mobile' : 'desktop'"
       class="slider"
       @scroll="onScroll">
    <DayItem
      v-for="day in days"
      :key="day.getTime()"
      :day="day"
      :weather="weatherStore.getWeather(day)"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useWeatherStore} from "@/stores";
import DayItem from "@/components/home/hourly/DayItem.vue";

export default defineComponent({
  name: "TenDayDetailed.vue",
  setup() {
    const slider = ref(null)
    const weatherStore = useWeatherStore();
    return {
      slider,
      weatherStore,
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
      scrollTimer: null as null | ReturnType<typeof setTimeout>,
      scrollToHour: false,
      days: [] as Date[] | undefined
    }
  },
  created() {
    this.getDays();
  },
  activated() {
    this.$nextTick(() => {
      this.getDayPositions();
      this.$nextTick(() => {
        if (!this.displayedDay) return;
        this.scrollToDay(this.displayedDay, true);
      });
    });
  },
  watch: {
    selectedDay: {
      handler: function () {
        if (!this.selectedDay) {
          this.scrollToHour = !this.scrollToHour;
          return;
        }
        if (this.displayedDay?.getDate() !== this.selectedDay.getDate()) this.scrollToHour = false;
        this.scrollToDay(this.selectedDay, false, this.scrollToHour ? 12 : 0);
      },
      deep: true
    },
    "weatherStore.currentWeather": function () {
      this.$nextTick(() => {
        this.getDayPositions();
        this.goToDay(this.days?.[0]);
        if (this.days) this.scrollToDay(this.days?.[0], true);
      });
    },
    "weatherStore.getDays": function () {
      this.getDays();
    }
  },
  computed: {
    isMobile() {
      // @ts-ignore
      return this.$isMobile();
    },
  },
  methods: {
    onScroll() {
      // @ts-ignore
      if (this.scrollTimer) clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        if (!this.displayedDay) return;
        // @ts-ignore
        const scrollLeft = this.slider?.scrollLeft;
        const entries = Object.entries(this.dayPositions).reverse();
        for (const [position, date] of entries) {
          if (scrollLeft >= parseInt(position) - 20) {
            if (this.displayedDay.getDate() !== date.getDate()) {
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
      this.dayPositions = {};
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // @ts-ignore
        const position = child.offsetLeft;
        const date = this.days?.[i];
        if (!date) continue;
        this.dayPositions[position] = date;
      }
    },
    scrollToDay(date: Date, instant: boolean = false, hour: number = 0) {
      const left = Object.entries(this.dayPositions).find(([, day]) => day.getDate() === date.getDate());
      if (!left) return;

      let leftOffset: number = parseInt(left[0]);

      // If hour is specified, scroll find left position of that hour
      if (hour) {
        const hourElement = document.querySelector(`#ten-day-detailed-${date.getDate()} .hour-${hour}`) as HTMLElement;
        if (hourElement) leftOffset += hourElement.offsetLeft;
      }

      // @ts-ignore
      this.slider?.scrollTo({left: leftOffset, behavior: instant ? 'instant' : 'smooth'});
    },
    getDays() {
      const days = this.weatherStore.getDays();
      if (!days) return;
      this.days = days.slice(0, 2); // Only show first two days
      this.$nextTick(() => {
        this.days = days; // Show all days after first render
        this.$nextTick(() => {
          this.getDayPositions();
        });
      });
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
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.mobile::-webkit-scrollbar {
  display: none;
}
</style>
