<template>
  <div
      class="warning-item"
      :class="warning ? 'yellow-warning' : ''">
    <slot />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "WarningItem.vue",
  props: {
    warning: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})
</script>

<style scoped>
.warning-item {
  text-align: center;
  line-height: 40px;
  width: 72px;
  max-width: 18%;
  height: 40px;
  margin: 0 0 0 1px;
  border-bottom: #7dd121 3px solid;
}

/*noinspection ALL*/
.yellow-warning {
  border-bottom: #f6e71d 3px solid;
  background-image: linear-gradient(0deg, #999237 0%, rgba(35, 34, 130, 0) 100%);
}
</style>
