<template>
  <main>
    <div v-if="!isLoading"
         class="navigation"
    >
      <HamburgerIcon class="navigation-button" style="height: 18px;" @click.stop="open" />
      <div class="drag-handle" />
      <SearchIcon class="search navigation-button" style="height: 24px;" @click.stop="openSearch"/>
    </div>
    <div v-else class="loader">
      <RadarSpinner
        :animation-duration="2000"
        :size="120"
        color="#62b8e7"
      />
      <div class="loader-text">
        {{ !online
          ? $t('home.offline')
          : weatherStore.status
            ? $t(weatherStore.status)
            : favouritesStore.loading
                ? $t('home.loadingFavourites')
                : alertsStore.loading
                    ? $t('home.loadingWarnings')
                    : ''
        }}
      </div>
    </div>
    <CurrentWeather v-if="!isLoading" />
    <Transition name="drop" v-if="!isLoading">
      <WarningsBar v-if="weatherStore.currentLocation.country === 'Finland'" />
    </Transition>
    <TenDayForecast v-if="!isLoading" />
    <WeatherRadar
      v-if="!isLoading
      && settingsStore.weatherRadar
      && weatherStore.currentLocation.country === 'Finland'"
    />
    <Observations v-if="!isLoading && weatherStore.currentLocation.country === 'Finland'" />
    <Footer />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HamburgerIcon from "@/components/icons/HamburgerIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import {OrbitSpinner, RadarSpinner} from 'epic-spinners'
import CurrentWeather from "@/components/home/nexthour/CurrentWeather.vue";
import WarningsBar from "@/components/home/warnings/WarningsBar.vue";
import TenDayForecast from "@/components/home/tenday/TenDayForecast.vue";
import WeatherRadar from "@/components/home/WeatherRadar/WeatherRadar.vue";
import Observations from "@/components/home/observations/Observations.vue";
import Footer from "@/components/home/Footer.vue";
import { useWeatherStore, useFavouritesStore, useSettingsStore, useAlertsStore } from "@/stores";

export default defineComponent({
  name: "HomeView",
  components: {
    RadarSpinner,
    OrbitSpinner,
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
  data() {
    return {
      online: navigator.onLine,
    };
  },
  created() {
    if(!this.online) {
      window.addEventListener("online", () => { this.online = true; }, { once: true });
    }
  },
  emits: ["open"],
  computed: {
    isLoading() {
      return !this.weatherStore.locatingComplete || !this.weatherStore.hasWeather || this.favouritesStore.loading || this.alertsStore.loading;
    },
  },
  methods: {
    open() {
      this.$emit("open");
    },
    openSearch() {
      // @ts-ignore
      this.$router.push("/favourites");
    },
  },
});
</script>

<!--suppress CssUnusedSymbol -->
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
.loader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100px;
  height: calc(100vh - 200px - 120px);
  background-color: var(--backgroundMediumLight);
}
.loader-text {
  margin-top: 50px;
  font-size: 18px;
  font-weight: 400;
  width: max-content;
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
