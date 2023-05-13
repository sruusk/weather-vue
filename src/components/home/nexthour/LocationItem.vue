<template>
  <div v-if="weather && Object.keys(weather).length" ref="item">
    <h2 v-if="weather.location.region">{{ weather.location.name }}, {{ weather.location.region }}</h2>
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
          <ShareButton @click="share" v-if="canShare">{{ $t('home.share') }}</ShareButton>
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
import domtoimage from 'dom-to-image';
import ClockIcon from "@/components/icons/ClockIcon.vue";
import ShareButton from "@/components/home/nexthour/ShareButton.vue";
import FeelsLike from "@/components/home/nexthour/FeelsLike.vue";
import CurrentWeatherBar from "@/components/home/nexthour/CurrentWeatherBar.vue";

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
    return {
      item,
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
      return `/symbols/animated/${this.weather.weatherSymbol}.svg`;
    }
  },
  methods: {
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
    share() {
      this.captureNodeScreenshot().then((image: any) => {
        navigator.share({
          title: 'Weather',
          text: `${this.$t('home.nextHourForecastFor')} ${this.weather.location.name}, ${this.weather.location.region}`,
          url: "https://weather.a32.fi",
          files: [image]
        }).catch((error: any) => {
          console.log('Error sharing', error);
        });
      });
    },
    captureNodeScreenshot() {
      return new Promise(resolve => {
        domtoimage.toBlob(this.item as any, { bgcolor: '#3a4da5'})
            .then(function (blob : any) {
              const file = new File([blob], 'weather.png', { type: 'image/png' });
              resolve(file);
            }).catch(function (error: any) {
              console.error('oops, something went wrong!', error);
            });
      });
    }
  }
})
</script>

<style scoped>
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
  color: #a3b4dc;
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
  color: #a3b4dc;
  text-align: center;
  margin: 0;
  padding: 0;
}
</style>
