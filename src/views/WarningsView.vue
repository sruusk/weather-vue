<template>
  <div class="warnings">
    <BackNavigation>Warnings</BackNavigation>
    <h1>Not implemented yet</h1>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";
export default defineComponent({
  name: "WarningsView",
  components: {
    BackNavigation
  },
})
</script>

<style scoped>
.warnings {
  width: 100%;
}
</style>
