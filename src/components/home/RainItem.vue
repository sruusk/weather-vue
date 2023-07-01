<template>
  <div>
    <div class="rain">
      <div class="rain-probability">
        <RainIconNegative v-if="negative"/>
        <RainIcon v-else/>
        <div class="rain-probability-value">{{ rainProbability === -1 ? '' : roundedRainProbability }} %</div>
      </div>
      <div class="rain-amount">{{ roundedRainAmount }} mm</div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import RainIcon from "@/components/icons/RainIcon.vue";
import RainIconNegative from "@/components/icons/RainIconNegative.vue";

export default defineComponent({
  name: "RainItem.vue",
  components: {
    RainIcon,
    RainIconNegative,
  },
  props: {
    rainProbability: {
      type: Number,
      required: true
    },
    rainAmount: {
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
    roundedRainProbability() {
      return Math.round(this.rainProbability);
    },
    roundedRainAmount() {
      return Math.round(this.rainAmount * 10) / 10;
    }
  }
})
</script>

<style scoped>
.rain {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: white;
  font-weight: 300;
  line-height: 18px;
}

.rain-probability {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.rain-probability-value {
  margin-left: 5px;
}
</style>
