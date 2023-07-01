<template>
  <div v-if="observationsStore.stations.length" class="header">{{ $t('home.weatherObservations') }}</div>
  <div v-if="observationsStore.stations.length" class="observations-carousel">
    <Splide ref="splide" :options="options">
      <SplideSlide v-for="station in observationsStore.stations" :key="station.location.name">
        <ObservationItem :station="station" class="item"/>
      </SplideSlide>
    </Splide>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import ObservationItem from "@/components/home/observations/ObservationItem.vue";
import {useObservationsStore} from "@/stores";

export default defineComponent({
  name: "ObservationsElement",
  setup() {
    const splide = ref(null);
    const observationsStore = useObservationsStore();
    return {
      splide,
      observationsStore
    };
  },
  components: {
    ObservationItem
  },
  data() {
    return {
      options: {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        flickMaxPages: 1,
        pagination: true,
        gap: '2rem',
        arrows: false,
      },
    }
  },
  watch: {
    "observationsStore.stations": function () {
      // @ts-ignore
      this.$nextTick(() => {
        // @ts-ignore
        this.splide.go(0);
      });
    }
  },
})
</script>

<style scoped>
.header {
  height: 45px;
  line-height: 45px;
  font-size: 14px;
  font-weight: 500;
  background-color: var(--backgroundLighter);
  padding: 0 0 0 12px;
  margin-bottom: -2px;
  transform: translateY(-1px); /* Inset to hide gap between previous element */
}

.observations-carousel {
  min-height: 550px;
  width: 100%;
  background-image: var(--backgroundObservations);
  padding-top: 35px; /* Make gap for the page indicators */
  contain: content;
}

.item {
  width: 100%;
  align-self: flex-start;
  contain: content;
}
</style>
