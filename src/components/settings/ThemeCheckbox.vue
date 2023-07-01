<template>
  <div :class="{'checked' : checked}" class="checkbox">
    <CheckmarkIcon v-if="checked"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import CheckmarkIcon from "@/components/icons/CheckmarkIcon.vue";

export default defineComponent({
  name: "ThemeCheckbox",
  components: {CheckmarkIcon},
  props: {
    checked: Boolean,
    color: String
  }
})
</script>

<style scoped>
.checkbox {
  width: 30px;
  height: 30px;
  border: 1px solid var(--backgroundLightest);
  background-color: v-bind(color);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
