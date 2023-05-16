<template>
  <div class="observation-chart">
    <canvas ref="chart"/>
  </div>
</template>

<script lang="ts">
import type { TimeSeriesObservation } from "@/types";
import {defineComponent, ref} from 'vue';
import {Chart} from "chart.js/auto";
import {useThemeStore} from "@/stores";

export default defineComponent({
  name: "ObservationChart",
  setup() {
    const chart = ref(null);
    const themeStore = useThemeStore();
    return {
      chart,
      themeStore,
    }
  },
  props: {
    temperature: {
      type: Array as () => TimeSeriesObservation[],
      required: false,
    },
    precipitation: {
      type: Array as () => TimeSeriesObservation[],
      required: false,
    },
  },
  data() {
    return {
      chartObject: null as Chart | any,
      windowResizeTimeout: null as any,
    }
  },
  created() {
      window.addEventListener("resize", this.myEventHandler);
  },
  unmounted() {
      window.removeEventListener("resize", this.myEventHandler);
  },
  activated() {
    if(this.chartObject !== null) this.chartObject.resize();
  },
  mounted() {
    const datasets = [] as any[];
    let tempMin = 0;
    //@ts-ignore
    if(this.temperature?.length) tempMin = Math.min(...this.temperature.map((item) => item.value));
    if (this.temperature?.length) {
      datasets.push({
        label: 'ºC',
        data: this.temperature.map((item) => { return {x: this.formatDate(item.time), y: item.value} }),
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: 'rgb(127,212,31)',
        borderWidth: 2,
        pointBorderWidth: 0,
      })
    }
    if (this.precipitation?.length) {
      datasets.push({
        label: 'mm',
        type: 'bar',
        data: this.precipitation.map((item) => { return {x: this.formatDate(item.time), y: item.value} }),
        backgroundColor: 'rgb(98,184,232)',
        borderColor: 'rgb(98,184,232)',
        borderWidth: 1,
        barThickness: 10,
        yAxisID: 'y2',
      })
    }

    // Labels are from past 12 hours, every 2 hours
    const labels = [] as string[];
    for (let i = 1; i < 12; i += 2) {
      const date = new Date();
      if(date.getMinutes() > 30) date.setHours(date.getHours() + 1);
      date.setHours(date.getHours() - i, 0, 0, 0);
      labels.push(this.formatDate(date));
    }

    this.chartObject = new Chart(this.$refs.chart as HTMLCanvasElement, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        responsive: false,
        maintainAspectRatio: true,
        parsing: {
          xAxisKey: 'x',
          yAxisKey: 'y'
        },
        scales: {
          y:  {
            beginAtZero: false,
            type: 'linear',
            alignToPixels: true,
            suggestedMax: tempMin + 5,
            ticks: {
              count: 5,
              color: [
                  "white",
                  "white",
                  "white",
                  "white",
                'rgb(127,212,31)'
              ],
              font: {
                size: 11,
              },
              callback: (value, index) => {
                if(index === 4) return 'ºC'
                else return value;
              },
            },
            border: {
              display: false
            },
            grid: {
              color: this.themeStore.theme.colours.backgroundLightest
            }
          },
          x: {
            ticks: {
              color: 'white',
              font: {
                size: 11
              },
              callback: (value, index) => {
                if(labels.includes(datasets[0].data[index].x)) return datasets[0].data[index].x;
                else return undefined;
              }
            },
            grid: {
              display: false
            }
          },
          y2: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            alignToPixels: true,
            suggestedMax: 20,
            ticks: {
              stepSize: 5,
              maxTicksLimit: 5,
              color: [
                "white",
                "white",
                "white",
                "white",
                'rgb(98,184,232)'
              ],
              font: {
                size: 11
              },
              callback: (value, index) => {
                if(index === 4) return 'mm'
                else return value;
              },
            },
            border: {
              display: false
            },
            grid: {
              color: this.themeStore.theme.colours.backgroundLightest
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  },
  methods: {
    formatDate(date: Date) {
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    myEventHandler() { // Resize chart after window resize event finished
      clearTimeout(this.windowResizeTimeout);
      this.windowResizeTimeout = setTimeout(() => {
        this.chartObject.resize();
      }, 100);
    }
  }
})
</script>

<style scoped>
.observation-chart {
  width: 100%;
  padding: 20px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.observation-chart canvas {
  width: 100%;
  height: 100%;
}
</style>
