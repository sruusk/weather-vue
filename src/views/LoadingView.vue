<template>
  <div class="loader">
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
        : $t('home.loadingForecast')
      }}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {RadarSpinner} from "epic-spinners";
import {useWeatherStore} from "@/stores";

export default defineComponent({
  name: "LoadingView",
  components: {
    RadarSpinner,
  },
  setup() {
    const weatherStore = useWeatherStore();
    return {
      weatherStore,
    }
  },
  data() {
    return {
      online: navigator.onLine,
    };
  },
  created() {
    if (!this.online) {
      window.addEventListener("online", () => {
        this.online = true;
      }, {once: true});
    }
  },
  watch: {
    'weatherStore.hasWeather': {
      handler() {
        if (this.weatherStore.hasWeather) {
          this.$router.push({name: 'home'});
        }
      }
    }
  }
})
</script>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.loader-text {
  color: white;
  padding-top: 50px;
  padding-bottom: 100px;
  font-size: 18px;
  font-weight: 400;
  width: max-content;
}
</style>
