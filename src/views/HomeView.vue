<template>
  <main v-if="weatherStore.hasWeather">
    <div class="navigation">
      <HamburgerIcon class="navigation-button" style="height: 18px;" @click.stop="open"/>
      <div class="drag-handle"/>
      <SearchIcon class="search navigation-button" style="height: 24px;" @click.stop="openSearch"/>
    </div>
    <CurrentWeather/>
    <Transition name="drop">
      <WarningsBar v-if="isFinland"/>
    </Transition>
    <TenDayForecast/>
    <WeatherRadar
      v-if="settingsStore.weatherRadar && isFinland"
    />
    <Observations v-if="isFinland"/>
    <Footer/>
  </main>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import HamburgerIcon from "@/components/icons/HamburgerIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import CurrentWeather from "@/components/home/nexthour/CurrentWeather.vue";
import WarningsBar from "@/components/home/warnings/WarningsBar.vue";
import TenDayForecast from "@/components/home/hourly/TenDayForecast.vue";
import WeatherRadar from "@/components/home/WeatherRadar/WeatherRadar.vue";
import Observations from "@/components/home/observations/Observations.vue";
import Footer from "@/components/home/Footer.vue";
import {useAlertsStore, useFavouritesStore, useSettingsStore, useWeatherStore} from "@/stores";

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
    const favouritesStore = useFavouritesStore();
    const settingsStore = useSettingsStore();
    const alertsStore = useAlertsStore();
    return {
      weatherStore,
      favouritesStore,
      settingsStore,
      alertsStore,
    };
  },
  emits: ["open"],
  computed: {
    isFinland() {
      return this.weatherStore.currentLocation.country === "Finland";
    },
  },
  methods: {
    open() {
      this.$emit("open");
    },
    openSearch() {
      // @ts-ignore
      this.$router.push("/search");
    },
  },
});
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
main {
  width: 100%;
  min-height: calc(100vh + 1px); /* +1px to prevent a bug where the scrollbar pops in and out */
  color: white;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
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

.navigation-button {
  z-index: 1000;
  padding: calc(env(titlebar-area-height, 10px) + 20px) 20px;
  cursor: pointer;
}

.drag-handle {
  width: 100%;
  position: absolute;
  height: 0;
  padding: env(titlebar-area-height, 0) 0 0 0;
  -webkit-app-region: drag;
  app-region: drag;
}

.drop-enter-active, .drop-leave-active {
  transition: height 1s ease-in-out, margin 1s ease-in-out;
}

.drop-enter-from, .drop-leave-to {
  height: 0;
  margin: 0;
}

.drop-enter-to, .drop-leave-from {
  height: 62px;
  margin: 9px 0 14px 0;
}
</style>
