<template>
  <div class="main">
    Not implemented yet
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

export default defineComponent({
  name: "FavouritesView.vue",
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

</style>
