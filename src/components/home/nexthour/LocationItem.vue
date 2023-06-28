<!--suppress JSVoidFunctionReturnValueUsed -->
<template>
  <div v-if="weather && Object.keys(weather).length" ref="item" class="item">
    <h2 v-if="weather.location.region">
      {{ weather.location.name }}, {{ region }}
    </h2>
    <h2 v-else>{{ weather.location.name }}</h2>
    <div class="weather">
      <img :src="weatherIcon" alt="weather icon" />
      <div class="temperature">
        <span class="temp">{{ tempPrefix(weather.temperature) }}</span>
        <span class="temp">{{ Math.round(Math.abs(weather.temperature)) }}</span>
        <span class="unit">°C</span>
      </div>
    </div>
    <div class="details">
      <div class="feelslike-row">
        <div class="time">
          <ShareButton class="share-button" @click="share" v-if="canShare">
            {{ loading ? `${$t('home.loading')}...` : $t('home.share') }}
          </ShareButton>
          <ClockIcon class="timeIcon" />
          <span class="time-value">{{ weather.time }}</span>
        </div>
        <FeelsLike :temperature="weather.feelsLike" />
      </div>
    </div>
    <CurrentWeatherBar :weather="weather" />
  </div>
</template>

<script lang="ts">
import type { HourWeather } from "@/types";
import { defineComponent, ref } from 'vue';
// @ts-ignore
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import countries from "i18n-iso-countries";
import ClockIcon from "@/components/icons/ClockIcon.vue";
import ShareButton from "@/components/home/nexthour/ShareButton.vue";
import FeelsLike from "@/components/home/nexthour/FeelsLike.vue";
import CurrentWeatherBar from "@/components/home/nexthour/CurrentWeatherBar.vue";
import {useSettingsStore} from "@/stores";

export default defineComponent({
  name: "LocationItem.vue",
  props: {
    weather: {
      type: Object as () => HourWeather,
      required: true,
    },
  },
  components: {
    ClockIcon,
    ShareButton,
    FeelsLike,
    CurrentWeatherBar,
  },
  setup() {
    const item = ref(null);
    const shareButton = ref(null);
    const settingsStore = useSettingsStore();
    return {
      item,
      shareButton,
      settingsStore
    };
  },
  data() {
    return {
      loading: false,
      errorLoading: false,
      canShare: !!navigator.share,
    };
  },
  computed: {
    weatherIcon() {
      return `/symbols/${this.settingsStore.useAnimations ? 'animated' : 'static'}/${this.weather.weatherSymbol}.svg`;
    },
    region() {
      if(this.weather.location.region === this.weather.location.country) {
        const countryCode = this.weather.location.country.length === 2 ? this.weather.location.country : countries.getAlpha2Code(this.weather.location.country, 'en');
        return countries.getName(countryCode, this.settingsStore.language);
      }
      return this.weather.location.region;
    },
  },
  methods: {
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
    async share() {
      if(this.loading) return;
      this.loading = true;
      try {
        const image: any = await this.captureNodeScreenshot();
        await navigator.share({
          title: 'Weather',
          text: `${this.$t('home.nextHourForecastFor')} ${this.weather.location.name}, ${this.weather.location.region}`,
          url: location.protocol + '//' + location.hostname,
          files: [image]
        });
      } catch (error) {
        console.log('Error sharing', error);
        window.alert('Error sharing');
      } finally {
        this.loading = false;
      }
    },
    captureNodeScreenshot() {
      return new Promise(resolve => {
        toBlob(this.item as any, {
          backgroundColor: '#3a4da5',
          filter: (node: any) => {
            const exclusionClasses = ['share-button'];
            return !exclusionClasses.some((classname) => node.classList?.contains(classname));
          }})
            .then(function (blob) {
              // @ts-ignore
              const file = new File([blob], 'weather.png', { type: 'image/png' });
              resolve(file);
            }).catch(function (error) {
              console.error('oops, something went wrong!', error);
              window.alert('Error sharing');
            });
      });
    }
  }
})
</script>

<style scoped>
.item {
  padding: 10px;
  contain: content;
}
h2 {
  font-size: 1.1rem;
  color: white;
  font-weight: 400;
  text-align: center;
  margin: 0;
  padding: 0;
  width: 100%;
}
.weather {
  display: flex;
  flex-direction: row;
  color: white;
  align-items: center;
  justify-content: space-between;
  margin: 15px 0 0 0;
  padding: 0;
  height: 100px;
}
.weather img {
  width: 150px;
  height: 150px;
  margin: 10px 0 0 0;
}
.temperature {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
  padding: 0;
}
.temp {
  font-size: 5rem;
  font-weight: 200;
  text-align: center;
  margin: 0;
  padding: 0;
  line-height: 5rem;
}
.unit {
  font-size: 1.2rem;
  font-weight: 200;
  color: #FFFFFF7F;
  text-align: center;
  margin: 10px 0 0 10px;
  padding: 0;
}
.details {
  margin: 10px 0 0 0;
}
.feelslike-row {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}
.time {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 0 5px 0;
  padding: 0;
}
.timeIcon {
  width: 16px;
  height: 16px;
  margin: 0 5px 0 20px;
}
.time-value {
  font-size: 14px;
  font-weight: 400;
  color: #FFFFFF7F;
  text-align: center;
  margin: 0;
  padding: 0;
}
</style>
