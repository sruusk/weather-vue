<template>
  <div class="main">
    <div class="header">
      <div class="location-details">
        <span>{{ $t('home.weatherStation') }}</span>
        <span class="dot">●</span>
        <span>{{ formattedTime }}</span>
        <span class="dot">●</span>
        <span>{{ $t('home.distance') }} {{ Math.round(station.location.distance / 100) / 10 }} km</span>
      </div>
      <div class="station-name">
        {{ station.location.name }}, {{ station.location.region }}
      </div>
    </div>
    <ObservationDetails :station="station" />
    <ObservationChart :precipitation="station.precipitationHistory" :temperature="station.temperatureHistory" />
  </div>
</template>

<script lang="ts">
import type { ObservationStation } from "@/types";
import {defineComponent} from 'vue';
import ObservationDetails from "@/components/home/observations/ObservationDetails.vue";
import ObservationChart from "@/components/home/observations/ObservationChart.vue";

export default defineComponent({
  name: "ObservationItem",
  components: {
    ObservationDetails,
    ObservationChart
  },
  props: {
    station: {
      type: Object as () => ObservationStation,
      required: true
    }
  },
  computed: {
    formattedTime() {
      return new Date(this.station.time).toLocaleString('fi-FI', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
})
</script>

<style scoped>
.location-details {
  font-size: 10px;
  font-weight: 300;
  display: inline-grid;
  grid-template-columns: repeat(5, auto);
  grid-gap: 3px;
  align-items: center;
}
.location-details .dot {
  font-size: 6px;
}
.station-name {
  margin: 10px 0;
  font-size: 16px;
}
</style>
