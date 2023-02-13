<template>
  <button class="share-button">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "ShareButton.vue"
})
</script>

<style scoped>
.share-button {
  background-color: #00000025;
  color: white;
  font-size: 12px;
  font-family: "Roboto", sans-serif;
  font-weight: normal;
  text-transform: uppercase;
  border: none;
  border-radius: 4px;
  height: 25px;
  line-height: 25px;
  padding: 0 10px;
}
</style>
