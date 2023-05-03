<template>
  <div class="warnings">
    <BackNavigation>Warnings</BackNavigation>
    <h1>INOP</h1>
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
.warnings h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    padding: 0;
    text-align: center;
}
</style>
