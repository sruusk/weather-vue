<!--suppress CssUnknownTarget -->
<template>
  <div class="main">
    <div class="header" :class="isLocation ? 'isLocation' : ''">
      <Carousel
          @slide-end="handleSlide"
          :wrap-around="true"
          v-if="favouriteLocations.length === favouritesWeather.length">
        <Slide
            v-for="fav in locations"
            :key="fav.name">
          <LocationItem
              class="item"
              :weather="getFavouriteWeather(fav)"
              v-if="fav.name !== weatherStore.gpsLocation.name" />
          <LocationItem
              class="item current-location"
              :weather="nextHourWeather"
              v-if="isLocation && fav.name === weatherStore.gpsLocation.name" />
        </Slide>
        <template #addons>
          <Pagination />
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script lang="ts">
import type { ForecastLocation, Weather as WeatherType, HourWeather } from "@/types";
import { defineComponent } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import LocationItem from "@/components/home/nexthour/LocationItem.vue";
import { useWeatherStore } from "@/stores";
import Weather from "@/weather";
import Settings from "@/settings";

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
    const weatherStore = useWeatherStore();
    return { weatherStore };
  },
  data() {
    return {
      favouriteLocations: [] as ForecastLocation[],
      favouritesWeather: [] as HourWeather[],
    }
  },
  beforeMount() {
    this.favouriteLocations = this.getFavourites();
    this.favouriteLocations.forEach((location) => {
      this.getFavouriteLocation(location);
    })
    if(this.weatherStore.locatingComplete && !this.isLocation) {
      console.log("Setting location to first favourite location", this.weatherStore.locatingComplete, this.isLocation)
      this.weatherStore.changeLocation(this.favouriteLocations[0])
    }
  },
  activated() {
    const favorites = this.getFavourites();
    const newFavorites = favorites.filter((fav) => {
      return !this.favouriteLocations.find((f) => f.name === fav.name && f.region === fav.region && f.identifier === fav.identifier)
    })
    const removedFavorites = this.favouriteLocations.filter((fav) => {
      return !favorites.find((f) => f.name === fav.name && f.region === fav.region && f.identifier === fav.identifier)
    }) as ForecastLocation[]
    if(newFavorites.length) {
      console.log("Adding new favourites", newFavorites);
      this.favouriteLocations = favorites;
      newFavorites.forEach((location) => {
        this.getFavouriteLocation(location);
      })
    }
    if(removedFavorites.length) {
      console.log("Removing favourites", removedFavorites);
      this.favouriteLocations = favorites;
      removedFavorites.forEach((location) => {
        this.favouritesWeather = this.favouritesWeather.filter((fav) => fav.location.name !== location.name && fav.location.region !== location.region && fav.location.identifier !== location.identifier)
      })
    }
  },
  computed: {
    isLocation() {
      return this.weatherStore.locationWeather && Object.keys(this.weatherStore.locationWeather).length
    },
    locations() {
      if(this.isLocation) {
        return [this.weatherStore.gpsLocation, ...this.favouriteLocations]
      } else if(!this.favouriteLocations.length && this.weatherStore.locatingComplete) {
        return [
            { // Set default location if no favourites are set and geolocation is not available
                name: "Kaivopuisto",
                identifier: "843554",
                region: "Helsinki",
                country: "Finland",
                lat: 60.15928,
                lon: 24.96119
            } as ForecastLocation
        ] as ForecastLocation[]
      } else {
        return this.favouriteLocations
      }
    },
    nextHourWeather() {
      return this.getNextHourWeather(this.weatherStore.gpsWeather);
    },
  },
  methods: {
    nextHour(){
      return new Date(new Date().setHours(new Date().getHours() + 1))
    },
    getNextHourWeather(weather: WeatherType) {
      return {
        "time": `${this.nextHour().getHours()}:00`,
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
      } as HourWeather
    },
    getFavourites() {
      const favourites = Settings.favourites;
      return favourites.length
          ? favourites
          : [] as ForecastLocation[];
    },
    getFavouriteLocation(location: ForecastLocation) {
      Weather.getWeatherNextHour(`${location.name},${location.region}`).then((weather: WeatherType) => {
        this.favouritesWeather.push(this.getNextHourWeather(weather));
      });
    },
    async handleSlide(data : { currentSlideIndex: number, prevSlideIndex: number, slidesCount: number }) {
      const { currentSlideIndex } = data;
      if(currentSlideIndex === 0) {
        if(this.isLocation) await this.weatherStore.changeLocation(this.weatherStore.gpsLocation);
        else await this.weatherStore.changeLocation(this.favouriteLocations[0]);
      }
      else {
        const fav = this.favouriteLocations[this.isLocation ? currentSlideIndex - 1 : currentSlideIndex];
        await this.weatherStore.changeLocation(fav);
      }
    },
    getFavouriteWeather(fav: ForecastLocation) {
      return this.favouritesWeather.find(f => f.location.name === fav.name && f.location.region === fav.region) as HourWeather;
    },
  }
})
</script>

<style scoped>
.main {
  height: 280px;
  width: 100%;
  padding: 60px 0 0 0;
  background-image: linear-gradient(200deg, #5582cd 0%, #242282 100%);
  border-bottom: 1px solid rgba(145, 149, 194, 0.2);
  box-shadow: #161e4d 0 0 5px 3px;
  contain: content;
}
.item {
  width: 100%;
  padding: 10px;
  contain: content;
}

/*noinspection CssUnusedSymbol*/
.carousel__pagination {
  top: -30px;
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
  background-color: #a8bce2;
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
