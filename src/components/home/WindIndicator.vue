<template>
  <div class="wind-indicator">
    <WindArrow
      v-if="!negative"
      :style="`transform: rotate(${180 + windDirection}deg);`"
      class="wind-arrow"/>
    <WindArrowNegative
      v-if="negative"
      :style="`transform: rotate(${180 + windDirection}deg);`"
      class="wind-arrow"/>
    <span class="wind-speed">{{ roundedWindSpeed }}</span>
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
