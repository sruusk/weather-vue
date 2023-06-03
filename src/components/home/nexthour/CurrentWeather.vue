<!--suppress CssUnknownTarget -->
<template>
  <div class="main">
    <div :class="{ 'isLocation': weatherStore.gpsLocation }" class="header">
      <!-- The v-if is here to prevent bugs when the carousel is not active/visible -->
      <Carousel
          v-if="active"
          ref="carousel"
          :wrap-around="true"
          @slide-end="handleSlide"
      >
        <Slide
            v-for="fav in locations"
            :key="fav.name + fav.gps ? '-gps' : fav.region"
        >
          <LocationItem
              v-if="!fav.gps"
              :weather="favouritesStore.getFavouriteWeather(fav) || getHourWeather(weatherStore.currentWeather)"
              class="item"
          />
          <LocationItem
              v-else
              :weather="nextHourWeather"
              class="item current-location"
          />
        </Slide>
        <template #addons>
          <Pagination/>
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script lang="ts">
import type {HourWeather, Weather as WeatherType} from "@/types";
import {defineComponent, ref} from 'vue';
import 'vue3-carousel/dist/carousel.css'
import {Carousel, Navigation, Pagination, Slide} from 'vue3-carousel'
import LocationItem from "@/components/home/nexthour/LocationItem.vue";
import {useFavouritesStore, useWeatherStore} from "@/stores";

export default defineComponent({
  name: "CurrentWeather.vue",
  components: {
    LocationItem,
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  setup() {
    const carousel = ref(null);
    const weatherStore = useWeatherStore();
    const favouritesStore = useFavouritesStore();
    return {
      carousel,
      weatherStore,
      favouritesStore
    };
  },
  data() {
    return {
      active: true,
      runAfterActive: () => { },
      prevLocations: [] as any[]
    }
  },
  activated() {
    this.active = true;
    this.$nextTick(() => {
      this.runAfterActive();
      this.runAfterActive = () => { };
    });
  },
  deactivated() {
    this.active = false;
  },
  watch: {
    "weatherStore.currentLocation": function () {
      const currentLocation = this.weatherStore.currentLocation;
      this.runAfterActive = () => {
        const index = this.locations.findIndex((location) => location.lat === currentLocation.lat && location.lon === currentLocation.lon);
        // @ts-ignore
        if (this.carousel) this.carousel.slideTo(index || 0);
      }
      if (this.active) this.runAfterActive();
    },
    "favouritesStore.favourites": function () {
      this.runAfterActive = () => {
        // @ts-ignore
        if (this.favouritesStore.favourites.length === 0) this.carousel.slideTo(0);
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
          ...this.favouritesStore.favourites
        ];
      } else if (this.favouritesStore.favourites.length === 0) {
        return this.weatherStore.hasWeather ? [this.weatherStore.currentLocation] : [];
      } else {
        return this.favouritesStore.favourites;
      }
    },
    nextHourWeather() {
      return this.getHourWeather(this.weatherStore.gpsWeather)
    },
  },
  methods: {
    async handleSlide(data: { currentSlideIndex: number, prevSlideIndex: number, slidesCount: number }) {
      const {currentSlideIndex} = data;
      await this.weatherStore.changeLocation(this.locations[currentSlideIndex]);
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
  width: 100%;
  padding: calc(env(titlebar-area-height, 0px) / 2 + 60px) 0 0 0;
  background-image: var(--backgroundGradient);
  border-bottom: 1px solid rgba(145, 149, 194, 0.2);
  box-shadow: #00000070 0 0 5px 3px;
  contain: content;
}

.item {
  width: 100%;
  padding: 10px;
  contain: content;
}

/*noinspection CssUnusedSymbol*/
.carousel__pagination {
  top: calc(-30px + env(titlebar-area-height, 0px) / 4);
  position: absolute;
  padding: 0;
  margin: 0;
  width: 100%;
}

:deep(.carousel__pagination-button) {
  height: 20px;
  width: 20px;
}

:deep(.carousel__pagination-button::after) {
  background-color: #FFFFFF7F;
  border-radius: 5px;
  width: 8px;
  height: 8px;
}

:deep(.carousel__pagination-button--active::after) {
  background-color: #fdfdfe;
}

.isLocation :deep(.carousel__pagination-item:nth-of-type(1) .carousel__pagination-button) {
  background-image: url("@/assets/images/location.svg");
  filter: brightness(0.8);
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
}

.isLocation :deep(.carousel__pagination-item:nth-of-type(1) .carousel__pagination-button--active) {
  background-image: url("@/assets/images/location.svg");
  filter: brightness(1);
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
}

.isLocation :deep(.carousel__pagination-item:nth-of-type(1) .carousel__pagination-button::after) {
  background-color: unset;
  border-radius: unset;
  width: unset;
  height: unset;
}

.isLocation :deep(.carousel__pagination-item:nth-of-type(1) .carousel__pagination-button--active::after) {
  background-color: unset;
  border-radius: unset;
  width: unset;
  height: unset;
}
</style>
