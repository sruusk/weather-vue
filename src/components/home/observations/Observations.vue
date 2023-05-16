<template>
  <div class="header" v-if="observationsStore.stations.length">{{ $t('home.weatherObservations') }}</div>
  <div class="observations-carousel" v-if="observationsStore.stations.length">
    <Carousel ref="carousel" :wrap-around="true">
      <Slide v-for="station in observationsStore.stations" :key="station.location.name">
        <ObservationItem :station="station" class="item" />
      </Slide>
      <template #addons>
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import ObservationItem from "@/components/home/observations/ObservationItem.vue";
import {useObservationsStore} from "@/stores";

export default defineComponent({
  name: "ObservationsElement",
  setup() {
    const carousel = ref(null);
    const observationsStore = useObservationsStore();
    return {
      carousel,
      observationsStore
    };
  },
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
    ObservationItem
  },
  watch: {
    "observationsStore.stations": function () {
      // @ts-ignore
      if(this.carousel) this.carousel.slideTo(0);
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
  padding-top: 30px; /* Make gap for the page indicators */
  contain: content;
}
.item {
  width: 100%;
  align-self: flex-start;
  contain: content;
}

/*noinspection ALL*/
.carousel__pagination {
  top: -20px; /* Make gap for the page indicators */
  position: absolute;
  padding: 0;
  margin: 0;
  width: 100%;
}
:deep(.carousel__pagination-button){
  height: 20px;
  width: 20px;
}
:deep(.carousel__pagination-button::after) {
  background-color: #FFFFFF7F;
  border-radius: 5px;
  width: 8px;
  height: 8px;
}
:deep(.carousel__pagination-button--active::after) {
  background-color: #fdfdfe;
}
</style>
