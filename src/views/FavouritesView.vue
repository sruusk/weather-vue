<template>
  <div class="main">
    <BackNavigation class="navigation">
      <input
          type="text"
          placeholder="Search location"
          class="input"
          v-model="searchString" />
    </BackNavigation>
    <div class="favourites-list">
      <div class="favourites-header">
        <div class="favourites-header-text">Favourites</div>
        <div class="favourites-header-button" @click="clearFavourites">Delete all</div>
      </div>
      <div class="favourite" v-for="fav in favourites" :key="fav.name">
        <div class="favourite-name">{{fav.name}}, {{fav.region}}</div>
        <div class="favourite-button" @click="removeFavourite(fav)">
          <div class="remove-button">-</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ForecastLocation } from "@/types";
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";

export default defineComponent({
  name: "FavouritesView.vue",
  components: {
    BackNavigation
  },
  data() {
    return {
      favourites: [] as ForecastLocation[],
      searchString: ""
    }
  },
  created() {
    this.favourites = JSON.parse(localStorage.getItem("favourites") || "[]");
  },
  methods: {
    removeFavourite(favourite: ForecastLocation) {
      this.favourites = this.favourites.filter(fav => fav.name !== favourite.name);
      localStorage.setItem("favourites", JSON.stringify(this.favourites));
    },
    clearFavourites() {
      this.favourites = [];
      localStorage.setItem("favourites", "[]");
    }
  }
})
</script>

<style scoped>
.main {
  width: 100%;
}
.navigation {
  background-color: #253478;
}
.input {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 5px;
  padding: 0 10px;
  font-size: 14px;
  margin-left: 10px;
}
.favourites-list {
  width: 100%;
  color: white;
  font-size: 12px;
}
.favourites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
  font-weight: 400;
  padding: 10px 20px;
}
.favourites-header-text {
  font-weight: 600;
}
.favourites-header-button {
  cursor: pointer;
}
.favourite {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  height: 40px;
  background-color: #253478;
  color: white;
  font-weight: 400;
}
.favourite-name {
  font-weight: 600;
}
.favourite-button {
  cursor: pointer;
}
.remove-button {
  font-size: 20px;
  font-weight: 600;
}
</style>
