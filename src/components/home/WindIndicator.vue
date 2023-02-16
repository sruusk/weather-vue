<template>
  <div class="wind-indicator">
    <WindArrow
        class="wind-arrow"
        v-if="!negative"
        :style="`transform: rotate(${windDirection}deg);`"/>
    <WindArrowNegative
        class="wind-arrow"
        v-if="negative"
        :style="`transform: rotate(${windDirection}deg);`"/>
    <span class="wind-speed" v-if="roundedWindSpeed !== 0">{{ roundedWindSpeed }}</span>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import WindArrow from "@/components/icons/WindArrow.vue";
import WindArrowNegative from "@/components/icons/WindArrowNegative.vue";

export default defineComponent({
  name: "WindIndicator.vue",
  components: {
    WindArrow,
    WindArrowNegative,
  },
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
  height: 45px;
  width: 45px;
  line-height: 45px;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  font-size: 12px;
  color: white;
  font-weight: 400;
  justify-content: flex-start;
  contain: content;
}
.wind-arrow {
  width: 45px;
  height: 45px;
}
.wind-speed {
  position: relative;
  width: 30px;
  margin-left: -37.5px;
  text-align: center;
}
</style>
