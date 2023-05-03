<template>
  <main v-if="weatherStore.hasWeather">
    <div class="navigation">
      <HamburgerIcon class="menu" @click.stop="open" />
      <SearchIcon class="search" @click.stop="openSearch"/>
    </div>
    <CurrentWeather />
    <WarningsBar v-if="showWarnings" :warnings="weatherStore.currentWeather?.warnings" />
    <TenDayForecast v-if="weatherStore.currentWeather" :weather="weatherStore.currentWeather" />
    <WeatherRadar v-if="weatherStore.currentWeather && enableWeatherRadar" :location="weatherStore.currentWeather.location" />
    <Observations v-if="weatherStore.currentWeather" :location="weatherStore.currentWeather.location" />
    <Footer />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Settings from "@/settings";
import HamburgerIcon from "@/components/icons/HamburgerIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import CurrentWeather from "@/components/home/nexthour/CurrentWeather.vue";
import WarningsBar from "@/components/home/warnings/WarningsBar.vue";
import TenDayForecast from "@/components/home/tenday/TenDayForecast.vue";
import WeatherRadar from "@/components/home/WeatherRadar/WeatherRadar.vue";
import Observations from "@/components/home/observations/Observations.vue";
import Footer from "@/components/home/Footer.vue";
import Weather from "@/weather";
import { useWeatherStore } from "@/stores";

export default defineComponent({
  name: "HomeView",
  components: {
    HamburgerIcon,
    CurrentWeather,
    WarningsBar,
    TenDayForecast,
    WeatherRadar,
    Observations,
    Footer,
    SearchIcon,
  },
  setup() {
    const weatherStore = useWeatherStore();
    return { weatherStore };
  },
  data() {
    return {
      enableWeatherRadar: Settings.weatherRadar,
      getWarnings: Settings.getWarnings
    };
  },
  emits: ["open"],
  created() {
    this.weatherStore.init();
  },
  activated() {
    this.getWarnings = Settings.getWarnings;
    this.enableWeatherRadar = Settings.weatherRadar
  },
  computed: {
    showWarnings() {
      return this.weatherStore.currentWeather?.warnings && this.getWarnings;
    }
  },
  methods: {
    open() {
      this.$emit("open");
    },
    openSearch() {
      this.$router.push("/favourites");
    },
    getWeatherNextHour( place: string) {
      return Weather.getWeatherNextHour(place);
    }
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
