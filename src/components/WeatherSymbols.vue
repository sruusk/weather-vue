<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <div class="symbols">
      <div class="header">
        <span>{{ $t('symbols.animated') }}</span>
        <span>{{ $t('symbols.static') }}</span>
      </div>
      <div class="symbol" v-for="symbol in symbols" :key="symbol">
        <img
          :src="`/symbols/animated/${symbol}.svg`"
          :alt="`Weather symbol ${symbol}`"
        />
        <img
          :src="`/symbols/static/${symbol}.svg`"
          :alt="`Weather symbol ${symbol}`"
        />
        <span>{{ $t(`symbols.symbols.${symbol}`) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "WeatherSymbols",
  data() {
    return {
      symbols: [ 1, 2, 21, 22, 23, 3, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 64, 71, 72, 73, 81, 82, 83, 91, 92 ]
    }
  }
})
</script>

<style scoped>
.symbols {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.symbol {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 10px 20px;
}
.symbol img {
  width: 100px;
  height: 100px;
}
.symbol span {
  font-size: 16px;
  font-weight: 400;
  color: white;
  text-align: center;
  margin: 0;
  padding: 0;
}
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 200px;
  margin: 0 20px;
}
.header span {
  font-size: 16px;
  font-weight: 400;
  color: white;
  text-align: center;
}
</style>
