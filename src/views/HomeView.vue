<template>
  <main v-if="currentWeather">
    <div class="navigation">
      <IconHamburger class="menu" @click.stop="open" />
      <SearchIcon class="search" @click.stop="openSearch"/>
    </div>
    <CurrentWeather
        :weather="currentWeather"
        :setLocation="setLocation"
        :current-location="currentLocation"
        :get-weather-by-place="getWeatherPlace"
        :locating-complete="locatingComplete" />
    <WarningsBar />
    <TenDayForecast :weather="currentWeather" />
    <WeatherRadar v-if="isWeatherLoaded" :location="currentWeather.location" />
    <Observations :location="currentWeather.location" />
    <Footer />
  </main>
</template>

<script lang="ts">
import type { ForecastLocation, Weather as WeatherType} from "@/types";
import { defineComponent } from "vue";
import IconHamburger from "@/components/icons/IconHamburger.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import CurrentWeather from "@/components/home/nexthour/CurrentWeather.vue";
import WarningsBar from "@/components/home/warnings/WarningsBar.vue";
import TenDayForecast from "@/components/home/tenday/TenDayForecast.vue";
import WeatherRadar from "@/components/home/WeatherRadar/WeatherRadar.vue";
import Observations from "@/components/home/observations/Observations.vue";
import Footer from "@/components/home/Footer.vue";
import Weather from "@/weather";

export default defineComponent({
  name: "HomeView",
  components: {
    IconHamburger,
    CurrentWeather,
    WarningsBar,
    TenDayForecast,
    WeatherRadar,
    Observations,
    Footer,
    SearchIcon,
  },
  data() {
    return {
      currentWeather: {} as WeatherType,
      currentLocation: {} as ForecastLocation,
      locatingComplete: false
    };
  },
  emits: ["open"],
  created() {
    this.getLocation();
  },
  computed: {
    isWeatherLoaded() {
      return Object.keys(this.currentWeather).length > 0;
    }
  },
  methods: {
    open() {
      this.$emit("open");
    },
    openSearch() {
      this.$router.push("/search");
    },
    getLocation() {
      if (navigator.geolocation) {
        console.log("Getting location...");
        navigator.geolocation.getCurrentPosition((position) => {
          console.log("Got location:", position);
          this.loadWeatherLatLon(position.coords.latitude, position.coords.longitude).then(() => {
            this.locatingComplete = true;
          });
        }, (error) => {
          this.locatingComplete = true;
          console.log("Error getting location:", error);
          //this.loadWeatherLatLon(60.159279, 24.961194) // Kaivopuisto, Helsinki as fallback
        });
      } else {
        this.locatingComplete = true;
        console.log("Geolocation is not supported by this browser.");
        //this.loadWeatherLatLon(60.159279, 24.961194) // Kaivopuisto, Helsinki as fallback
      }
    },
    getWeatherPlace(place: string) {
      return Weather.getWeather(place);
    },
    loadWeatherLatLon(lat: number, lon: number) {
      return new Promise(resolve => {
        Weather.getWeatherByLatLon(lat, lon).then((response) => {
          this.currentWeather = response;
          this.currentLocation = response.location;
          resolve(response);
          console.log(response);
        });
      });
    },
    loadWeather(location: string) {
      Weather.getWeather(location).then((response) => {
        this.currentWeather = response;
        console.log(response);
      });
    },
    setLocation(location: string) {
      console.log("Setting location:", location);
      this.loadWeather(location);
    },
  },
});
</script>

<style scoped>
main {
  width: 100%;
  color: white;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
main::-webkit-scrollbar {
  display: none;
}
.navigation {
  width: 100%;
  display: flex;
  height: 0;
  flex-direction: row;
  justify-content: space-between;
}
.menu {
  padding: 30px 20px;
  height: 18px;
  cursor: pointer;
  z-index: 1000;
}
.search {
  padding: 30px 20px;
  cursor: pointer;
  height: 24px;
  z-index: 1000;
}
</style>
