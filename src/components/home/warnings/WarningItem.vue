<template>
  <div
    :class="severity"
    class="warning-item">
    <slot/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "WarningItem.vue",
  props: {
    severity: {
      type: String,
      required: false,
      default: ""
    }
  }
})
</script>

<!--suppress CssUnusedSymbol -->
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

.Minor {
  border-bottom: #7dd121 3px solid;
  background-image: linear-gradient(0deg, #449937 0%, rgba(35, 34, 130, 0) 100%);
}

.Moderate {
  border-bottom: #f6e71d 3px solid;
  background-image: linear-gradient(0deg, #999237 0%, rgba(35, 34, 130, 0) 100%);
}

.Severe {
  border-bottom: #fda500 3px solid;
  background-image: linear-gradient(0deg, #a37025 0%, rgba(35, 34, 130, 0) 100%);
}

.Extreme {
  border-bottom: #f63d1d 3px solid;
  background-image: linear-gradient(0deg, #b32929 0%, rgba(35, 34, 130, 0) 100%);
}
</style>
