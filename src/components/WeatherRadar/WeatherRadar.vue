<template>
  <div class="weather-radar-container">
    <div class="header">Weather radar</div>
    <div class="radar">
      <div id="fmi-animation-time" ref="animationTime" />
      <div id="fmi-animator" class="fmi-animator" ref="animator" />
      <div id="fmi-animation-time-options"
           :style="showTimeOptions ? 'display: unset;' : 'display: none;'" >
        <div id="fmi-time-option-15m"
             class="fmi-time-option"
             :class="{selected: timeStep === 15}"
              @click.stop="timeStep = 15; setAnimationTime();">15</div>
        <div id="fmi-time-option-30m"
             class="fmi-time-option"
              :class="{selected: timeStep === 30}"
              @click.stop="timeStep = 30; setAnimationTime();">30</div>
        <div id="fmi-time-option-60m" class="fmi-time-option"
              :class="{selected: timeStep === 60}"
              @click.stop="timeStep = 60; setAnimationTime();">60</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import type { ForecastLocation } from "@/types";
import { defineComponent, ref } from 'vue';
import MarkerIcon from "@/components/icons/MarkerIcon.vue";
import MetOClient from "@fmidev/metoclient";
import config from "@/components/WeatherRadar/config.json";

export default defineComponent({
  name: "WeatherRadar.vue",
  components: {
    MarkerIcon, // TODO: Add this to template
  },
  props: {
    autoPlay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: Object as () => ForecastLocation,
      required: true
    }
  },
  setup() {
    const animationTime = ref(null);
    const animator = ref(null);

    return {
      animationTime,
      animator,
    }
  },
  data() {
    return {
      timeStep: 15,
      showTimeOptions: false,
      metoclient: null,
      map: null,
      timeStepButton: null,
      timeSlider: null,
    }
  },
  mounted() {
    config.center = this.center;
    // https://github.com/fmidev/metoclient#constructor
    this.metoclient = new MetOClient(config);
    this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
      // statements to handle any exceptions
      console.error(error);
    });
  },
  watch: {
    timeStep() {
      this.showTimeOptions = false;
      this.timeStepButton.textContent = this.timeStep;
    },
    location() {
      config.center = this.center;
      console.log("Setting new location to MetOClient", config.center);
      this.metoclient.destroy();
      this.metoclient = new MetOClient(config);
      this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
        // statements to handle any exceptions
        console.error(error);
      });
    }
  },
  computed: {
    // convert from lat and long to ETRS89/UTM zone 35N (N-E)
    // (EPSG:3067) (ETRS89 / TM35FIN(E,N)) (https://epsg.io/3067)
    center() {
      const { lat, lon } = this.location;
      const [x, y] = MetOClient.transform([lon, lat], 'EPSG:4326', 'EPSG:3067');
      console.log("Center", [x, y]);
      return [x, y];
    }
  },
  methods: {
    renderCallback() {
      if(this.autoPlay) this.metoclient.play({
        delay: 1000,
        time: Date.now()
      });

      this.map = this.metoclient.get('map');
      this.timeSlider = this.metoclient.get('timeSlider');

      this.timeStepButton = this.animator.querySelector('.fmi-metoclient-timeslider-step-button');
      this.timeStepButton.textContent = this.timeStep;
      this.timeStepButton.addEventListener('click', () => {
        this.showTimeOptions = !this.showTimeOptions;
      });

      this.animationTime.textContent = this.timeSlider.getClock();
      this.map.on('change:time', this.updateAnimationTime);
    },
    setAnimationTime() {
      const time = this.timeStep;
      const newConfig = this.metoclient.get('options');
      newConfig.layers.find((layer: any) => layer.id === "radar").time.range =
          `every ${time} minute for 4 times history`;
      newConfig.layers.find((layer: any) => layer.id === "forecast").time.range =
          `every ${time} minute for 4 times history AND every ${time} minute for 4 times future`;
      newConfig.layers.find((layer: any) => layer.id === "flash").time.range =
          `every ${time} minute for 4 times history`;
      this.metoclient.set('options', newConfig);
    },
    updateAnimationTime() {
      this.animationTime.textContent = this.timeSlider.getClock();
    },
  },
})
</script>

<style scoped>

.weather-radar-container {
  width: 100%;
  height: 100vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: #253e80;
}
.header {
  height: 45px;
  padding: 0 0 0 12px;
  font-size: 14px;
  line-height: 45px;
  font-weight: 500;
  color: white;
}
.radar {
  width: 100%;
  height: 100%;
}
.fmi-animator {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#fmi-animation-time-options {
  display: none;
  height: 120px;
  width: 52px;
  margin-top: -200px;
  margin-left: calc(100vw - 50px);
  background-color: transparent;
  position: absolute;
  z-index: 1000;
}

.fmi-time-option {
  width: 36px;
  height: 36px;
  padding-top: 7px;
  color: white;
  background-color: rgba(53, 89, 185, 0.4);
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 4px;
  box-sizing: border-box;
  border-radius: 18px;
  cursor: pointer;
}

.fmi-time-option.selected {
  background-color: rgba(53, 89, 185, 0.8);
}

#fmi-animation-time,#fmi-fullscreen-animation-time {
  z-index: 1000;
  position: absolute;
  margin: 10px;
  width: 80px;
  height: 20px;
  line-height: 20px;
  background-color: white;
  color: black;
  opacity: 0.5;
  font-size: 16px;
  text-align: center;
}

#fmi-fullscreen-animation-time {
  top: 16px;
}
</style>
<style>
@import '@/assets/weatherRadar.css';
</style>
