<template>
  <div style="width: 100%">
    <BackNavigation> {{ $t('routes.symbols') }}</BackNavigation>
    <WeatherSymbols/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";
import WeatherSymbols from "@/components/WeatherSymbols.vue";

export default defineComponent({
  name: "SymbolsView",
  components: {WeatherSymbols, BackNavigation}
})
</script>

<style scoped>

</style>
