<template>
  <div class="main">
    <div class="header" :class="isLocation ? 'isLocation' : ''">
      <Carousel
          @slide-end="handleSlide"
          v-if="favouriteLocations.length === favouritesWeather.length">
        <Slide
            v-for="fav in locations"
            :key="fav.name">
          <LocationItem
              class="item"
              :weather="getFavouriteWeather(fav)"
              v-if="fav.name !== currentLocation.name" />
          <LocationItem
              class="item current-location"
              :weather="nextHourWeather"
              v-if="isLocation && fav.name === currentLocation.name" />
        </Slide>
        <template #addons>
          <Pagination />
        </template>
      </Carousel>
    </div>
  </div>
</template>

<script lang="ts">
import type { ForecastLocation, Weather, HourWeather } from "@/types";
import { defineComponent } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import LocationItem from "@/components/home/nexthour/LocationItem.vue";

export default defineComponent({
  name: "CurrentWeather.vue",
  components: {
    LocationItem,
    Carousel,
    Slide,
    Pagination,
    Navigation,
  },
  props: {
    setLocation: {
      type: Function,
      required: true
    },
    currentLocation: {
      type: Object as () => ForecastLocation,
      required: true
    },
    currentLocationWeather: {
      type: Object as () => Weather,
      required: true
    },
    getWeatherByPlace: {
      type: Function,
      required: true
    },
    locatingComplete: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      favouriteLocations: [ // TODO: get from local storage
        {
          country: "Finland",
          name: "Paavola",
          region: "Lahti",
          identifier: "6930944"
        },
        {
          country: "Finland",
          name: "Hervanta",
          region: "Tampere",
          identifier: "643952"
        }
      ] as ForecastLocation[],
      favouritesWeather: [] as HourWeather[],
      nextHourWeather: {} as HourWeather
    }
  },
  created() {
    this.favouriteLocations.forEach((location) => {
      this.getFavouriteLocation(location);
    })
    if(this.locatingComplete && !this.isLocation) {
      console.log("Setting location to first favourite location", this.locatingComplete, this.isLocation)
      this.setLocation(`${this.favouriteLocations[0].name},${this.favouriteLocations[0].region}`)
    }
  },
  computed: {
    isLocation() {
      return this.currentLocation && Object.keys(this.currentLocation).length
    },
    locations() {
      return this.isLocation ? [this.currentLocation, ...this.favouriteLocations] : this.favouriteLocations
    }
  },
  watch: {
    currentLocationWeather: {
      handler: function () {
        this.nextHourWeather = this.getNextHourWeather(this.currentLocationWeather);
      },
      deep: true
    },
    currentLocation: {
      handler: function () {
        console.log("currentLocation changed", this.currentLocation)
      },
      deep: true
    },
    locatingComplete: {
      handler: function () {
        console.log("Locating Complete!", this.locatingComplete)
        if(!this.isLocation) {
          this.setLocation(`${this.favouriteLocations[0].name},${this.favouriteLocations[0].region}`)
        }
      },
      deep: true
    }
  },
  methods: {
    nextHour(){
      return new Date(new Date().setHours(new Date().getHours() + 1))
    },
    getNextHourWeather(weather: Weather) {
      return {
        "time": `${this.nextHour().getHours()}:00`,
        "location": weather.location,
        "temperature": weather.temperature[0].value,
        "windDirection": weather.windDirection[0].value,
        "windSpeed": weather.windSpeed[0].value,
        "windGust": weather.windGust[0].value,
        "weatherSymbol": weather.weatherSymbol[0].value,
        "precipitation": weather.precipitation[0].value,
        "humidity": weather.humidity[0].value,
        "feelsLike": weather.feelsLike[0].value,
      } as HourWeather
    },
    getFavouriteLocation(location: ForecastLocation) {
      this.getWeatherByPlace(`${location.name},${location.region}`).then((weather: Weather) => {
        this.favouritesWeather.push(this.getNextHourWeather(weather));
      });
    },
    handleSlide(data : { currentSlideIndex: number, prevSlideIndex: number, slidesCount: number }) {
      const { currentSlideIndex } = data;
      if(currentSlideIndex === 0) {
        if(this.isLocation) this.setLocation(`${this.currentLocation.name},${this.currentLocation.region}`);
        else this.setLocation(`${this.favouriteLocations[0].name},${this.favouriteLocations[0].region}`);
      }
      else {
        const fav = this.favouriteLocations[this.isLocation ? currentSlideIndex - 1 : currentSlideIndex];
        this.setLocation(`${fav.name},${fav.region}`);
      }
    },
    getFavouriteWeather(fav: ForecastLocation) {
      return this.favouritesWeather.find(f => f.location.name === fav.name && f.location.region === fav.region) as HourWeather;
    }
  }
})
</script>

<style scoped>
.main {
  height: 270px;
  width: 100%;
  padding: 70px 0 0 0;
  background-image: linear-gradient(200deg, #5582cd 0%, #242282 100%);
  border-bottom: 1px solid rgba(145, 149, 194, 0.2);
  box-shadow: #161e4d 0 0 5px 3px;
}
.item {
  width: 100%;
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
  background-image: url("/images/location.svg");
  filter: brightness(0.8);
  background-size: 40%;
  background-repeat: no-repeat;
  background-position: center;
  width: 20px;
  height: 20px;
}
.isLocation :deep(.carousel__pagination-item:nth-of-type(1) .carousel__pagination-button--active) {
  background-image: url("/images/location.svg");
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
