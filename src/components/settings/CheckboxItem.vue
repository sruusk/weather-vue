<template>
  <div class="checkbox" :class="{'checked' : checked}">
    <CheckmarkIcon v-if="checked" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import CheckmarkIcon from "@/components/icons/CheckmarkIcon.vue";

export default defineComponent({
  name: "CheckboxItem.vue",
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
  border: 1px solid #62b8e8;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.checkbox.checked {
  background-color: #62b8e8;
}
</style>
