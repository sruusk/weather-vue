<template>
  <div class="header" v-if="observationStations.length">{{ $t('home.weatherObservations') }}</div>
  <div class="observations-carousel" v-if="observationStations.length">
    <Carousel ref="carousel">
      <Slide v-for="station in observationStations" :key="station.location.name">
        <ObservationItem :station="station" class="item" />
      </Slide>
      <template #addons>
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>

<script lang="ts">
import type { ForecastLocation, ObservationStation } from "@/types";
import {defineComponent, ref} from 'vue';
import { getObservationsForClosestStations } from "@/weather";
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import ObservationItem from "@/components/home/observations/ObservationItem.vue";

export default defineComponent({
  name: "Observations.vue",
  setup() {
    const carousel = ref(null);
    return {
      carousel
    };
  },
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
    ObservationItem
  },
  props: {
    location: {
      type: Object as () => ForecastLocation,
      required: true
    }
  },
  data() {
    return {
      observationStations: [] as ObservationStation[],
    }
  },
  watch: {
    location: {
      handler() {
        this.getObservationStations();
        // @ts-ignore
        if(this.carousel) this.carousel.slideTo(0); // Reset carousel to first page when location changes
      },
      deep: true
    }
  },
  methods: {
    getObservationStations() {
      getObservationsForClosestStations(this.location.lat, this.location.lon, 4)
        .then((stations) => {
          console.log("Observation stations", stations);
          this.observationStations = stations;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
})
</script>

<style scoped>
.header {
  height: 45px;
  line-height: 45px;
  font-size: 14px;
  font-weight: 500;
  background-color: #3559b9;
  padding: 0 0 0 12px;
  margin-bottom: -2px;
  transform: translateY(-1px); /* Inset to hide gap between previous element */
}
.observations-carousel {
  min-height: 550px;
  width: 100%;
  background-image: linear-gradient(180deg, #456fc8 0%, #242282 100%);
  padding-top: 30px; /* Make gap for the page indicators */
}
.item {
  width: 100%;
  align-self: flex-start;
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
  background-color: #a8bce2;
  border-radius: 5px;
  width: 8px;
  height: 8px;
}
:deep(.carousel__pagination-button--active::after) {
  background-color: #fdfdfe;
}
</style>
