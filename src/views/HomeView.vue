<template>
  <main>
    <div v-if="weatherStore.locatingComplete && !favouritesStore.loading" class="navigation">
      <HamburgerIcon class="menu" @click.stop="open" />
      <SearchIcon class="search" @click.stop="openSearch"/>
    </div>
    <div v-else class="loader">
      <BreedingRhombusSpinner :animation-duration="1500" :color="'#62b8e7'" />
      <div class="loader-text">
        {{ weatherStore.status ? $t(weatherStore.status) : favouritesStore.loading ? $t('home.loadingFavourites') : '' }}
      </div>
    </div>
    <CurrentWeather v-if="weatherStore.locatingComplete && !favouritesStore.loading" />
    <WarningsBar v-if="showWarnings && !favouritesStore.loading" :warnings="weatherStore.currentWeather?.warnings" />
    <TenDayForecast v-if="weatherStore.currentWeather && !favouritesStore.loading" :weather="weatherStore.currentWeather" />
    <WeatherRadar
      v-if="weatherStore.currentWeather
      && settingsStore.weatherRadar
      && weatherStore.locatingComplete
      && weatherStore.currentWeather.location.country === 'Finland'
      && !favouritesStore.loading"
      :location="weatherStore.currentWeather.location"
    />
    <Observations v-if="weatherStore.currentWeather && !favouritesStore.loading" :location="weatherStore.currentWeather.location" />
    <Footer />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HamburgerIcon from "@/components/icons/HamburgerIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import { BreedingRhombusSpinner } from 'epic-spinners'
import CurrentWeather from "@/components/home/nexthour/CurrentWeather.vue";
import WarningsBar from "@/components/home/warnings/WarningsBar.vue";
import TenDayForecast from "@/components/home/tenday/TenDayForecast.vue";
import WeatherRadar from "@/components/home/WeatherRadar/WeatherRadar.vue";
import Observations from "@/components/home/observations/Observations.vue";
import Footer from "@/components/home/Footer.vue";
import Weather from "@/weather";
import { useWeatherStore, useFavouritesStore, useSettingsStore } from "@/stores";

export default defineComponent({
  name: "HomeView",
  components: {
    BreedingRhombusSpinner,
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
    const favouritesStore = useFavouritesStore();
    const settingsStore = useSettingsStore();
    return {
        weatherStore,
        favouritesStore,
        settingsStore
    };
  },
  data() {
    return {

    };
  },
  emits: ["open"],
  computed: {
    showWarnings() {
      return this.weatherStore.currentWeather?.warnings;
    }
  },
  methods: {
    open() {
      this.$emit("open");
    },
    openSearch() {
      // @ts-ignore
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
  min-height: calc(100vh);
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
.loader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px;
  height: calc(100vh - 200px - 120px);
  background-color: #303193;
}
.loader-text {
  margin-top: 50px;
  font-size: 18px;
  font-weight: 400;
}
</style>
