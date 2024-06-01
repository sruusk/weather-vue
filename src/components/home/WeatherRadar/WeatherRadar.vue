<!--suppress TypeScriptUnresolvedReference, TypeScriptValidateTypes -->
<template>
  <div class="weather-radar-container">
    <div class="header">
      <div>
        {{ $t('home.weatherRadar') }}
      </div>
      <div>
        <div ref="zoom" class="zoom"/>
        <!-- <ReloadIcon @click="reloadRadar"/> -->
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
import {MMLApiKey} from "@/constants";
import MarkerIcon from "@/components/icons/MarkerIcon.vue";
import MetOClient from "@fmidev/metoclient";
import Zoom from 'ol/control/Zoom.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import { stylefunction } from 'ol-mapbox-style';
import proj4 from 'proj4';
import { get as projection } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';
import MVT from 'ol/format/MVT.js';
import normalconfig from "@/components/home/WeatherRadar/config.json";
import mmlconfig from "@/components/home/WeatherRadar/alt_config.json"
import {useSettingsStore, useThemeStore, useWeatherStore} from "@/stores";
import ReloadIcon from "@/components/icons/ReloadIcon.vue";

export default defineComponent({
  name: "WeatherRadar",
  components: {
    ReloadIcon,
    MarkerIcon,
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
      weatherStore
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
      runOnActive: null,
      refresh: 0,
      config: normalconfig,
    }
  },
  mounted() {
    if(MMLApiKey) {
      this.config = mmlconfig
      window.addEventListener('visibilitychange', this.visibilityListener);
    }
    this.config.center = this.center;
    this.config.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // https://github.com/fmidev/metoclient#constructor
    if (this.$route.name === 'home') {
      this.metoclient = new MetOClient(this.config);
      this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
        // statements to handle any exceptions
        console.error(error);
      });
    }
    window.addEventListener('reloadRadar', this.reloadRadar);

    // Reload radar at even 15 minutes
    const now = new Date();
    const minutes = now.getMinutes();
    const timeToNext = 15 - (minutes % 15);
    this.refresh = setTimeout(() => {
      this.reloadRadar();
      setInterval(() => {
        this.reloadRadar();
      }, 15 * 60 * 1000);
    }, timeToNext * 60 * 1000);
  },
  activated() {
    if (!this.metoclient) {
      this.metoclient = new MetOClient(this.config);
      this.metoclient.render().then(this.renderCallback).catch((error: Error) => {
        // statements to handle any exceptions
        console.error(error);
      });
    }
  },
  beforeUnmount() {
    if (this.metoclient) {
      try {
        this.metoclient.destroy();
      } catch (e) {
      }
    }
    window.removeEventListener('reloadRadar', this.reloadRadar);
    clearTimeout(this.refresh);
    window.removeEventListener('visibilitychange', this.visibilityListener);
  },
  watch: {
    timeStep() {
      this.showTimeOptions = false;
      this.timeStepButton.textContent = this.timeStep;
    },
    'weatherStore.currentLocation': {
      handler: function () {
        this.updateLocation();
      },
      deep: true,
    },
  },
  computed: {
    // convert from lat and long to ETRS89/UTM zone 35N (N-E)
    // (EPSG:3067) (ETRS89 / TM35FIN(E,N)) (https://epsg.io/3067)
    center() {
      const {lat, lon} = this.weatherStore.currentLocation;
      return MetOClient.transform([lon, lat], 'EPSG:4326', 'EPSG:3067');
    }
  },
  methods: {
    renderCallback() {
      if (this.autoPlay) this.metoclient.play({
        delay: 1000,
        time: Date.now()
      });
      else this.metoclient?.previous();

      this.map = this.metoclient.get('map');
      this.timeSlider = this.metoclient.get('timeSlider');


      if (this.zoomCtrl) {
        this.zoomCtrl.setMap(this.map);
      } else {
        this.zoomCtrl = new Zoom({
          className: 'zoom',
          target: this.zoom
        });
        this.map.addControl(this.zoomCtrl)
      }

      if(MMLApiKey) {
        // Add EPSG:3067 projection
        proj4.defs('EPSG:3067', "+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs");
        register(proj4);
        this.addMMLBackgroundMap();
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
        `every ${time} minute for 1 times history and every ${time} minute for 4 times future`;
      newConfig.layers.find((layer: any) => layer.id === "flash").time.range =
        `every ${time} minute for 4 times history`;
      this.metoclient.set('options', newConfig);
    },
    updateAnimationTime() {
      this.animationTime.textContent = this.timeSlider.getClock();
    },
    updateLocation() {
      console.log("Setting new location to MetOClient", this.center);
      try {
        this.metoclient.get('map').getView().setCenter(this.center);
      } catch (e) {
        console.error("MetOClient error", e);
        console.error("Reloading radar");
        this.$nextTick(() => {
          this.reloadRadar();
        });
      }
    },
    reloadRadar() {
      useSettingsStore().setWeatherRadar(false);
      this.$nextTick(() => {
        useSettingsStore().setWeatherRadar(true);
      });
    },
    addMMLBackgroundMap() {
      // Check if the map exists and already has the MML background map
      if (this.map && this.map.getLayers().getArray().find((layer) => layer.get('name') === 'taustakartta')) {
        console.log("MML background map already exists");
        return Promise.resolve();
      }
      return new Promise(resolve => {
        fetch(`https://avoin-karttakuva.maanmittauslaitos.fi/vectortiles/tilejson/taustakartta/1.0.0/taustakartta/default/v20/ETRS-TM35FIN/tilejson.json?api-key=${MMLApiKey}`)
          .then((response) => response.json())
          .then(async (TileJSON) => {
            const newLayer = new VectorTileLayer({
              source: new VectorTileSource({
                format: new MVT(),
                projection: projection('EPSG:3067'),
                maxZoom: TileJSON.maxzoom,
                minZoom: TileJSON.minzoom,
                extent: [-549049, 6291300, 890177, 8389549],
                tileSize: 512,
                url: TileJSON.tiles[0],
                tileLoadFunction: (tile, src) => {
                  tile.setLoader(async (extent, resolution, projection) => {
                    if(!src.includes('api-key')) src += `?api-key=${MMLApiKey}`;
                    fetch(src).then((response) => {
                      response.arrayBuffer().then((data) => {
                        const format = tile.getFormat();
                        let features = format.readFeatures(data, {
                          extent: extent,
                          featureProjection: projection,
                        });
                        features = features.filter((feature) => {
                          return [
                            'vesisto_alue',
                            'liikenne',
                            'maankaytto',
                            'vesisto_viiva',
                            'nimisto',
                            'alueraja'
                          ].includes(feature.get('layer'));
                        })
                        tile.setFeatures(features);
                      });
                    })
                  });
                }
              }),
            });
            fetch(`https://avoin-karttakuva.maanmittauslaitos.fi/vectortiles/stylejson/v20/taustakartta.json?TileMatrixSet=ETRS-TM35FIN&api-key=${MMLApiKey}`)
              .then((response) => response.json())
              .then((style) => {
                newLayer.setStyle(stylefunction(newLayer, style, 'taustakartta'));
                // Add the MML background map to the bottom of the map
                this.map.getLayers().insertAt(0, newLayer);
                resolve();
              });
          });
      });
    },
    visibilityListener() {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          this.addMMLBackgroundMap().then(() => {
            this.$nextTick(() => {
              // Reload radar component if the MML background map is still not found
              if (this.map && this.map.getLayers().getArray().find((layer) => layer?.values_?.['mapbox-source'] === 'taustakartta') === undefined) {
                this.reloadRadar();
              } // Reload radar component if there are multiple ol-viewport elements
              else if(this.animator?.querySelectorAll('.ol-viewport')?.length > 1) {
                this.reloadRadar();
              }
            });
          });
        }, 500);
      }
    }
  },
})
</script>

<!--suppress CssInvalidPseudoSelector -->
<style scoped>

.weather-radar-container {
  width: 100%;
  height: calc(min(max(3 / 4 * 100vh, 600px), 100vw));
  min-height: calc(min(max(3 / 4 * 100vh, 600px), 100vw));
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
  margin: 0 12px 0 0;
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
:deep(.invert #fmi-animator .ol-layers) {
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

.invert .marker {
  filter: hue-rotate(180deg) saturate(1.5) invert(1);
}
</style>
<style>
@import '@/assets/weatherRadar.css';
</style>
