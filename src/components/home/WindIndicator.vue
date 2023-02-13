<template>
  <div class="wind-indicator">
    <img :src="getIndicator()" alt=""/>
    <span class="wind-speed" v-if="roundedWindSpeed !== 0">{{ roundedWindSpeed }}</span>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "WindIndicator.vue",
  props: {
    windDirection: {
      type: Number,
      required: true
    },
    windSpeed: {
      type: Number,
      required: true
    },
    negative: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    roundedWindSpeed() {
      return Math.round(this.windSpeed);
    }
  },
  methods: {
    getIndicator() {
      if(this.windSpeed === 0)
        return `/windarrows/${this.negative ? 'negative' : 'positive'}/0.svg`;
      else
        return `/windarrows/${this.negative ? 'negative' : 'positive'}/${this.getWindDirection().toLowerCase()}.svg`;
    },
    getWindDirection() {
      if (this.windDirection >= 0 && this.windDirection <= 22.5) {
        return "N";
      } else if (this.windDirection > 22.5 && this.windDirection <= 67.5) {
        return "NE";
      } else if (this.windDirection > 67.5 && this.windDirection <= 112.5) {
        return "E";
      } else if (this.windDirection > 112.5 && this.windDirection <= 157.5) {
        return "SE";
      } else if (this.windDirection > 157.5 && this.windDirection <= 202.5) {
        return "S";
      } else if (this.windDirection > 202.5 && this.windDirection <= 247.5) {
        return "SW";
      } else if (this.windDirection > 247.5 && this.windDirection <= 292.5) {
        return "W";
      } else if (this.windDirection > 292.5 && this.windDirection <= 337.5) {
        return "NW";
      } else if (this.windDirection > 337.5 && this.windDirection <= 360) {
        return "N";
      } else {
        return "0"
      }
    },
  }
})
</script>

<style scoped>
.wind-indicator {
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  line-height: 50px;
  text-align: center;
  font-size: 12px;
  color: white;
  font-weight: 400;
  margin-top: 15px;
  justify-content: flex-start;
  width: 45px;
}
.wind-indicator img {
  width: 45px;
  height: 45px;
}
.wind-speed {
  position: relative;
  width: 30px;
  margin-left: -37px;
  text-align: center;
}
</style>
