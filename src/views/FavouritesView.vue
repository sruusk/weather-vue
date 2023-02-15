<template>
  <div class="main">
    <BackNavigation>Favourites</BackNavigation>
    <h1>Not implemented yet</h1>
    <div class="search">
      <h1>Search</h1>
    </div>
    <div class="favourites">
      <h1>Favourites</h1>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";

export default defineComponent({
  name: "FavouritesView.vue",
  components: {
    BackNavigation
  },
  date() {
    return {
      favourites: []
    }
  },
  methods: {
    getFavourites() {
      // Get favourites from local storage
    }
  }
})
</script>

<style scoped>
.main {
  width: 100%;
}
</style>
