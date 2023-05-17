<!--suppress CssUnknownTarget -->
<template>
  <div class="main">
    <div class="header" :class="{ 'isLocation': weatherStore.gpsLocation }">
      <Carousel
          ref="carousel"
          @slide-end="handleSlide"
          :wrap-around="true"
      >
        <Slide
            v-for="fav in locations"
            :key="fav.name">
          <LocationItem
              class="item"
              :weather="favouritesStore.getFavouriteWeather(fav) || getHourWeather(weatherStore.currentWeather)"
              v-if="fav.name !== weatherStore.gpsLocation?.name" />
          <LocationItem
              class="item current-location"
              :weather="nextHourWeather"
              v-if="weatherStore.gpsLocation && fav.name === weatherStore.gpsLocation?.name" />
        </Slide>
        <template #addons>
          <Pagination />
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script lang="ts">
import type { Weather as WeatherType, HourWeather } from "@/types";
import { defineComponent, ref } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import LocationItem from "@/components/home/nexthour/LocationItem.vue";
import { useWeatherStore } from "@/stores";
import { useFavouritesStore } from "@/stores";

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

    }
  },
  watch: {
    "favouritesStore.favourites": function () {
      // @ts-ignore
      if(this.carousel) this.carousel.slideTo(0);
    },
  },
  computed: {
    locations() {
      if(this.weatherStore.gpsLocation) {
        return [this.weatherStore.gpsLocation, ...this.favouritesStore.favourites];
      } else if(this.favouritesStore.favourites.length === 0) {
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
    async handleSlide(data : { currentSlideIndex: number, prevSlideIndex: number, slidesCount: number }) {
      const { currentSlideIndex } = data;
      if(currentSlideIndex === 0) {
        if(this.weatherStore.gpsLocation) await this.weatherStore.changeLocation(this.weatherStore.gpsLocation);
        else await this.weatherStore.changeLocation(this.favouritesStore.favourites[0]);
      }
      else {
        const fav = this.favouritesStore.favourites[this.weatherStore.gpsLocation ? currentSlideIndex - 1 : currentSlideIndex];
        await this.weatherStore.changeLocation(fav);
      }
    },
    getHourWeather(weather: WeatherType | undefined): HourWeather {
      if(!weather) return undefined as unknown as HourWeather;
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
:deep(.carousel__pagination-button){
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
