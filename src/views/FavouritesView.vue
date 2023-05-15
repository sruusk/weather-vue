<template>
  <div class="main">
    <BackNavigation class="navigation">
      <input
          type="text"
          :placeholder="`${$t('settings.inputLocation')}, ${$t('settings.forExample')}: Kaivopuisto Helsinki`"
          class="input"
          ref="searchInput"
          @keydown.enter="search"
          v-model="searchString" />
    </BackNavigation>
    <div class="favourites-list">
      <div class="favourites-header">
        <div class="favourites-header-text">{{ $t("settings.favourites") }}</div>
        <div class="favourites-header-button"
             @click="favouritesStore.removeAllFavourites()"
        >
          {{ $t("settings.deleteAll") }}
        </div>
      </div>
      <div class="favourite" v-for="fav in favouritesStore.favourites" :key="fav.name">
        <div class="favourite-name">{{fav.name}}, {{fav.region}}</div>
        <div class="favourite-button" @click="favouritesStore.removeFavourite(fav)">
          <div class="remove-button">-</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import Weather from "@/weather";
import {useFavouritesStore} from "@/stores";
import BackNavigation from "@/components/BackNavigation.vue";

export default defineComponent({
  name: "FavouritesView",
  components: {
    BackNavigation
  },
  setup() {
    const searchInput = ref(null) as any
    const favouritesStore = useFavouritesStore();
    return {
      searchInput,
      favouritesStore
    };
  },
  data() {
    return {
      searchString: ""
    }
  },
  methods: {
    search() {
      this.searchInput.blur();
      this.searchString = this.searchString.trim();
      if(this.searchString.includes(",")) {
        const parts = this.searchString.split(",");
        if(parts.length === 2) {
          this.searchString = `${parts[0].trim()},${parts[1].trim()}`;
        } else this.searchString = "Error!, Invalid input";
      } else if(this.searchString.includes(" ")) {
        const parts = this.searchString.split(" ");
        if(parts.length === 2) {
          this.searchString = `${parts[0].trim()},${parts[1].trim()}`;
        } else this.searchString = "Error!, Invalid input";
      }

      Weather.getWeather(this.searchString).then((weather) => {
        if(!weather.location.region) throw new Error("Invalid location");
        this.favouritesStore.addFavourite(weather.location);
        this.searchString = "";
      }).catch((error) => {
        console.error("Error while searching for location", error);
        this.searchString = "Error! Location not found";
      });
    }
  }
})
</script>

<style scoped>
.main {
  width: 100%;
}
.navigation {
  background-color: var(--backgroundSettingsItem);
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
.favourites-list > div {
  border-bottom: var(--backgroundLight) 1px solid;
}
.favourites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 25px;
  font-weight: 400;
  margin: 10px 20px 0 20px;
  padding: 0 0 10px 0;
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
  margin: 0 20px;
  height: 50px;
}
.favourite-name {
  font-weight: 400;
}
.favourite-button {
  cursor: pointer;
}
.remove-button {
  width: 25px;
  height: 25px;
  font-size: 25px;
  font-weight: 600;
  line-height: 21px;
  text-align: center;
  border-radius: 50%;
  background-color: darkred;
}
</style>
