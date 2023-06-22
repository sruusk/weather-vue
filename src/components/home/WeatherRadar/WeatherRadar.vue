<template>
  <div class="weather-radar-container">
    <div class="header">
      <div>
        {{ $t('home.weatherRadar') }}
      </div>
      <div>
        <div ref="zoom" class="zoom"/>
        <ReloadIcon @click="reloadRadar"/>
      </div>
    </div>
    <div :class="{ 'invert': themeStore.theme.invertRadar }" class="radar">
      <div id="fmi-animation-time" ref="animationTime"/>
      <div id="fmi-animator" ref="animator" class="fmi-animator"/>
      <div id="fmi-animation-time-options"
           :style="showTimeOptions ? 'display: unset;' : 'display: none;'">
        <div id="fmi-time-option-15m"
             :class="{selected: timeStep === 15}"
             class="fmi-time-option"
             @click.stop="timeStep = 15; setAnimationTime();">15
        </div>
        <div id="fmi-time-option-30m"
             :class="{selected: timeStep === 30}"
             class="fmi-time-option"
             @click.stop="timeStep = 30; setAnimationTime();">30
        </div>
        <div id="fmi-time-option-60m" :class="{selected: timeStep === 60}"
             class="fmi-time-option"
             @click.stop="timeStep = 60; setAnimationTime();">60
        </div>
      </div>
      <MarkerIcon class="marker"/>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import {defineComponent, ref} from 'vue';
import MarkerIcon from "@/components/icons/MarkerIcon.vue";
import MetOClient from "@fmidev/metoclient";
import Zoom from 'ol/control/Zoom.js';
import config from "@/components/home/WeatherRadar/config.json";
import {useSettingsStore, useThemeStore, useWeatherStore} from "@/stores";
import ReloadIcon from "@/components/icons/ReloadIcon.vue";

export default defineComponent({
  name: "WeatherRadar.vue",
  components: {
    ReloadIcon,
    MarkerIcon, // TODO: Add this to template
  },
  props: {
    autoPlay: {
      type: Boolean,
      default: false,
    }
  },
  setup() {
    const animationTime = ref(null);
    const animator = ref(null);
    const zoom = ref(null);
    const themeStore = useThemeStore();
    const weatherStore = useWeatherStore();

    return {
      animationTime,
      animator,
      zoom,
      themeStore,
      weatherStore,
    }
  },
  data() {
    return {
      timeStep: 15,
      showTimeOptions: false,
      metoclient: null,
      zoomCtrl: null,
      map: null,
      timeStepButton: null,
      timeSlider: null,
      newLocation: false,
    }
  },
  mounted() {
    if (this.$route.name !== 'home') {
      this.newLocation = true;
      return;
    }

    config.center = this.center;
    // https://github.com/fmidev/metoclient#constructor
    this.metoclient = new MetOClient(config);
    this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
      // statements to handle any exceptions
      console.error(error);
    });
  },
  beforeUnmount() {
    if (this.metoclient) {
      try {
        this.metoclient.destroy();
      } catch (e) {
      }
    }
  },
  watch: {
    timeStep() {
      this.showTimeOptions = false;
      this.timeStepButton.textContent = this.timeStep;
    },
    'weatherStore.currentLocation': {
      handler: function () {
        if (this.weatherStore.currentLocation.country !== "Finland") return;
        if (this.$route.name === "home") this.$nextTick(() => {
          this.updateLocation();
        });
        else this.newLocation = true;
      },
      deep: true,
    },
    '$route'(to) {
      if (this.newLocation && to.name === "home") {
        // Wait for the map to be rendered before updating the location
        this.$nextTick(() => {
          this.updateLocation();
        });
        this.newLocation = false;
      }
    },
  },
  computed: {
    // convert from lat and long to ETRS89/UTM zone 35N (N-E)
    // (EPSG:3067) (ETRS89 / TM35FIN(E,N)) (https://epsg.io/3067)
    center() {
      const {lat, lon} = this.weatherStore.currentLocation;
      const [x, y] = MetOClient.transform([lon, lat], 'EPSG:4326', 'EPSG:3067');
      return [x, y];
    }
  },
  methods: {
    renderCallback() {
      if (this.autoPlay) this.metoclient.play({
        delay: 1000,
        time: Date.now()
      });

      this.map = this.metoclient.get('map');
      this.timeSlider = this.metoclient.get('timeSlider');


      if(this.zoomCtrl) {
        this.zoomCtrl.setMap(this.map);
      } else {
        this.zoomCtrl = new Zoom({
          className: 'zoom',
          target: this.zoom
        });
        this.map.addControl(this.zoomCtrl)
      }

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
    updateLocation() {
      config.center = this.center;
      console.log("Setting new location to MetOClient", config.center);
      try {
        try {
          this.metoclient.destroy();
        } catch (e) {
        }
        this.metoclient = new MetOClient(config);
        this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
          // statements to handle any exceptions
          console.error("MetOClient render error", error);
        });
      } catch (e) {
        console.error("MetOClient error", e);
      }
    },
    updateZoom(zoom: number) {
      const newConfig = this.metoclient.get('options');
      newConfig.zoom = zoom;
      this.metoclient.set('options', newConfig);
    },
    reloadRadar() {
      useSettingsStore().setWeatherRadar(false);
      this.$nextTick(() => {
        useSettingsStore().setWeatherRadar(true);
      });
    },
  },
})
</script>

<style scoped>

.weather-radar-container {
  width: 100%;
  height: 100vw;
  max-height: calc(max(3 / 4 * 100vh, 600px));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--backgroundMediumLight);
  contain: content;
}

.header {
  height: 45px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.header > div {
  margin-left: 12px;
  font-size: 14px;
  line-height: 45px;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
}

.header > div > * {
  margin-right: 12px;
}

.header > div > svg {
  width: 30px;
  height: 30px;
  fill: white;
}

.zoom {
  height: 100%;
}

.zoom :deep(.zoom) {
  position: relative;
  background-color: unset;
  display: flex;
}

.zoom :deep(.zoom button) {
  width: 28px;
  height: 28px;
  margin: 0 5px 0 0;
  border-radius: 50%;
  border: white 2px solid;
  background-color: unset;
  color: white;
  font-weight: 800;
}

.radar {
  width: 100%;
  height: 100%;
}

/*noinspection CssUnusedSymbol*/
:global(.invert #fmi-animator .ol-layers) {
  filter: hue-rotate(180deg) saturate(1.5) invert(1);
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

/*noinspection CssUnusedSymbol*/
.fmi-time-option.selected {
  background-color: rgba(53, 89, 185, 0.8);
}

/*noinspection CssUnusedSymbol*/
#fmi-animation-time, #fmi-fullscreen-animation-time {
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

/*noinspection CssUnusedSymbol*/
#fmi-fullscreen-animation-time {
  top: 16px;
}

.marker {
  position: absolute;
  left: calc(50% - 8px);
  top: calc(50% - 6px);
  height: 26px;
}
</style>
<style>
@import '@/assets/weatherRadar.css';
</style>
