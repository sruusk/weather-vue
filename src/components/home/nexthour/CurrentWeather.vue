<!--suppress CssUnknownTarget -->
<template>
  <div class="main">
    <div :class="{ 'isLocation': weatherStore.gpsLocation }" class="header">
      <!-- The v-if is here to prevent bugs when the carousel is not active/visible -->
      <Splide
        v-if="active || !runAfterActive"
        ref="splide"
        :options="options"
        @splide:move="handleSlide"
        @splide:drag="handleDragStart"
      >
        <SplideSlide
          v-for="fav in locations"
          :key="fav.name + fav.gps ? '-gps' : fav.region"
        >
          <LocationItem
            v-if="!fav.gps"
            :weather="favouritesStore.locations.length
              ? favouritesStore.getFavouriteWeather(fav)
              : getHourWeather(weatherStore.currentWeather)"
          />
          <LocationItem
            v-else
            :weather="nextHourWeather"
          />
        </SplideSlide>
      </Splide>
    </div>
  </div>
</template>

<script lang="ts">
import type {HourWeather, Weather as WeatherType} from "@/types";
import {defineComponent, ref} from 'vue';
import LocationItem from "@/components/home/nexthour/LocationItem.vue";
import {useFavouritesStore, useWeatherStore} from "@/stores";
// @ts-ignore
import type {Splide} from "@splidejs/vue-splide";

export default defineComponent({
  name: "CurrentWeather",
  components: {
    LocationItem,
  },
  setup() {
    const splide = ref(null);
    const weatherStore = useWeatherStore();
    const favouritesStore = useFavouritesStore();

    return {
      splide,
      weatherStore,
      favouritesStore
    };
  },
  data() {
    return {
      active: true, // These are still needed to prevent bugs when splide is not active/visible
      runAfterActive: undefined as undefined | (() => void),
      options: {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        flickMaxPages: 1,
        flickPower: 300,
        pagination: true,
        gap: '2rem',
        arrows: false,
        waitForTransition: false,
        autoplay: false
      },
      slideTimeout: null as null | ReturnType<typeof setTimeout>,
      dragging: false
    }
  },
  activated() {
    this.active = true;
    this.$nextTick(() => {
      if (this.runAfterActive) this.runAfterActive();
    });
  },
  deactivated() {
    this.active = false;
  },
  watch: {
    "weatherStore.currentLocation": function () {
      const currentLocation = this.weatherStore.currentLocation;
      this.runAfterActive = () => {
        this.$nextTick(() => {
          const index = this.locations.findIndex((location) => location.lat === currentLocation.lat && location.lon === currentLocation.lon);
          // @ts-ignore
          if (this.splide) this.splide.go(index || 0);
          this.runAfterActive = undefined;
        });
      }
      if (this.active) this.runAfterActive();
    },
    "favouritesStore.locations": function () {
      this.runAfterActive = () => {
        // @ts-ignore
        if (this.favouritesStore.locations.length === 0) this.splide.go(0);
        this.$nextTick(() => {
          const currentLocation = this.weatherStore.currentLocation;
          const index = this.locations.findIndex((location) => location.lat === currentLocation.lat && location.lon === currentLocation.lon);
          // @ts-ignore
          if (index != this.splide.index) {
            // @ts-ignore
            this.splide.go(index || 0);
          }
        });
        this.runAfterActive = undefined;
      }
      if (this.active) this.runAfterActive();
    }
  },
  computed: {
    locations(): any[] {
      if (this.weatherStore.gpsLocation) {
        return [
          {
            ...this.weatherStore.gpsLocation,
            gps: true
          },
          ...this.favouritesStore.locations
        ];
      } else if (this.favouritesStore.locations.length === 0) {
        return this.weatherStore.hasWeather ? [this.weatherStore.currentLocation] : [];
      } else {
        return this.favouritesStore.locations;
      }
    },
    nextHourWeather() {
      return this.getHourWeather(this.weatherStore.gpsWeather)
    },
  },
  methods: {
    async handleSlide(splide: typeof Splide, index: number) {
      if (this.slideTimeout) clearTimeout(this.slideTimeout);
      this.slideTimeout = setTimeout(() => {
        this.weatherStore.changeLocation(this.locations[index]);
      }, 1000);
    },
    handleDragStart() {
      if (this.slideTimeout) clearTimeout(this.slideTimeout);
    },
    getHourWeather(weather: WeatherType | undefined): HourWeather {
      if (!weather) return undefined as unknown as HourWeather;
      return {
        "time": `${(new Date(new Date().setHours(new Date().getHours() + 1))).getHours()}:00`,
        "location": weather.location,
        "temperature": weather.temperature[0].value,
        "windDirection": weather.windDirection[0].value,
        "windSpeed": weather.windSpeed[0].value,
        "windGust": weather.windGust[0].value,
        "weatherSymbol": weather.weatherSymbol[0].value,
        "precipitation": weather.precipitation[0].value,
        "probabilityOfPrecipitation": weather.probabilityOfPrecipitation ? weather.probabilityOfPrecipitation[0].value : undefined,
        "humidity": weather.humidity[0].value,
        "feelsLike": weather.feelsLike[0].value,
      } as HourWeather;
    }
  }
})
</script>

<style scoped>
.main {
  height: 280px;
  min-height: 280px;
  padding: calc(env(titlebar-area-height, 0px) / 2 + 60px) 0 0 0;
  background-image: var(--backgroundGradient);
  border-bottom: 1px solid rgba(145, 149, 194, 0.2);
  box-shadow: #00000070 0 0 5px 3px;
  contain: content;
}

/*noinspection CssUnusedSymbol*/
.main > .isLocation :deep([role="presentation"]):nth-of-type(1) .splide__pagination__page {
  background-image: url("@/assets/images/location.svg") !important;
  filter: brightness(0.8);
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px !important;
  height: 20px !important;
  background-color: unset !important;
  margin: 5px 2px 0 0 !important;
}

/*noinspection CssUnusedSymbol*/
.main > .isLocation :deep([role="presentation"]):nth-of-type(1) .splide__pagination__page.is-active {
  filter: brightness(1);
}
</style>
