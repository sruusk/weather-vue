<template>
  <div class="feelslike">
    <span>{{ tempPrefix(temperature) }}</span>
    <span>{{ Math.round(Math.abs(temperature)) }}</span>
    <span class="feelslike-unit">°C</span>
    <BasicIcon class="icon" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BasicIcon from "@/components/icons/feelslike/BasicIcon.vue";

export default defineComponent({
  name: "FeelsLike.vue",
  props: {
    temperature: {
      type: Number,
      required: true,
    },
  },
  components: {
    BasicIcon
  },
  methods: {
    tempPrefix(temp: number) {
      return temp > 0 ? "+" : "-";
    },
  }
})
</script>

<style scoped>
.feelslike {
  display: flex;
  align-items: flex-end;
  align-content: flex-end;
  font-size: 1.1rem;
  font-weight: 400;
  color: #fff;
  margin-right: 12px;
}
.feelslike span {
  margin-bottom: 3px;
}
.feelslike-unit {
  font-weight: 400;
  color: #a3b4dc;
  margin-right: 15px;
}
.icon {
  width: 50px;
  height: 50px;
}
</style>
