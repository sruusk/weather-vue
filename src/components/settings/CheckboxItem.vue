<template>
  <div :class="{'checked' : checked}" class="checkbox">
    <CheckmarkIcon v-if="checked"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import CheckmarkIcon from "@/components/icons/CheckmarkIcon.vue";

export default defineComponent({
  name: "CheckboxItem",
  components: {
    CheckmarkIcon
  },
  props: {
    checked: Boolean
  }
})
</script>

<style scoped>
.checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid var(--backgroundLightest);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkbox.checked {
  background-color: var(--backgroundLightest);
  filter: brightness(1.2);
}
</style>
