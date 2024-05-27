<template>
  <div class="main">
    <BackNavigation>
      <input
        ref="searchInput"
        v-model="searchString"
        :placeholder="`${$t('settings.inputLocation')}, ${$t('settings.forExample')}: Kaivopuisto Helsinki`"
        class="input"
        type="text"
        @keydown.enter="search"/>
    </BackNavigation>
    <ListSelection v-if="selection.length" :items="selection" @select="handleSelect"/>
    <div v-if="favouritesStore.favourites.length" class="favourites-list">
      <div class="favourites-header">
        <div class="favourites-header-text">{{ $t("settings.favourites") }}</div>
        <div class="favourites-header-button"
             @click="favouritesStore.removeAllFavourites()"
        >
          {{ $t("settings.deleteAll") }}
        </div>
      </div>
      <draggable
        v-model="favouritesStore.favourites"
        @change="favouritesStore.saveFavourites()"
        handle=".drag-indicator"
      >
        <div v-for="fav in favouritesStore.favourites" :key="fav.name" class="favourite">
          <div class="drag-indicator">
            <div class="arrows">
              <span>▲</span>
              <span>▼</span>
            </div>
          </div>
          <div class="favourite-name">{{ fav.name }}, {{ translateRegion(fav) }}</div>
          <div class="favourite-button remove-button" @click.stop="favouritesStore.removeFavourite(fav)">
            <div class="remove-dash"/>
          </div>
        </div>
      </draggable>
    </div>
    <div v-if="favouritesStore.history.length" class="favourites-list">
      <div class="favourites-header">
        <div class="favourites-header-text">{{ $t("settings.recent") }}</div>
        <div class="favourites-header-button"
             @click="favouritesStore.clearHistory()"
        >
          {{ $t("settings.deleteAll") }}
        </div>
      </div>
      <div
        v-for="location in favouritesStore.history"
        :key="location.name"
        class="favourite history"
        @click.stop="() => { favouritesStore.addHistory(location); $router.push('/') }"
      >
        <div class="favourite-name">{{ location.name }}, {{ translateRegion(location) }}</div>
        <div
          class="favourite-button"
          :class="isInFavourites(location) ? 'remove-button' : 'add-button'"
          @click.stop="favouritesStore.addFavourite(location)">
          <div class="remove-dash"/>
          <div v-if="!isInFavourites(location)" class="add-dash"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import Weather from "@/weather";
import countries from "i18n-iso-countries";
import {useFavouritesStore, useSettingsStore} from "@/stores";
import {VueDraggableNext} from 'vue-draggable-next'
import BackNavigation from "@/components/BackNavigation.vue";
import type {ForecastLocation} from "@/types";
import ListSelection from "@/components/ListSelection.vue";
import {search as findLocation} from "@/openweather";

export default defineComponent({
  name: "FavouritesView",
  components: {
    ListSelection,
    BackNavigation,
    draggable: VueDraggableNext
  },
  setup() {
    const searchInput = ref(null) as any
    const favouritesStore = useFavouritesStore();
    const settingsStore = useSettingsStore();
    return {
      searchInput,
      favouritesStore,
      settingsStore
    };
  },
  data() {
    return {
      searchString: "",
      selection: [] as any[]
    }
  },
  methods: {
    async search() {
      this.searchInput.blur();
      this.searchString = this.searchString.trim();
      let searchString = this.searchString;

      if (searchString.includes(" ")) {
        const parts = this.searchString.split(" ");
        if (parts.length > 1) searchString = `${parts.slice(0, parts.length - 1).join(" ").trim()},${parts[parts.length - 1].trim()}`;
        console.log(searchString);
      }

      let location;

      try {
        location = await Weather.getLocation(searchString);
      } catch (e) {
        try {
          if(searchString.includes(','))
            location = await Weather.getLocation(searchString.replace(',', ' '));
          else { // noinspection ExceptionCaughtLocallyJS
            throw new Error('No location found');
          }
        } catch (e) {
          const list = await findLocation(this.searchString);
          if (list?.length) this.selection = list;
          else alert(this.$t('settings.noneFound'));
          return;
        }
      }
      if(location?.region) {
        if (this.$route.path === '/search') {
          await this.favouritesStore.addHistory(location);
          this.$router.push('/');
        } else await this.favouritesStore.addFavourite(location);
      }
      this.searchString = "";
    },
    handleSelect(selected: any) {
      const country = countries.getName(selected.country, 'en') as string;
      const newEntry = {
        name: selected.name,
        country: country,
        region: selected.state || country,
        lat: selected.lat,
        lon: selected.lon,
        identifier: ''
      };

      if (this.$route.path === '/search') {
        this.favouritesStore.addHistory(newEntry);
        this.$router.push('/');
      } else this.favouritesStore.addFavourite(newEntry);
      this.selection = [];
      this.searchString = "";
    },
    findLocation,
    translateRegion(location: ForecastLocation) {
      if (location.region === location.country) {
        const countryCode = location.country.length === 2 ? location.country : countries.getAlpha2Code(location.country, 'en') as string;
        return countries.getName(countryCode, this.settingsStore.language);
      }
      return location.region;
    },
    isInFavourites(location: ForecastLocation) {
      return this.favouritesStore.favourites.some((fav) => fav.name === location.name && fav.region === location.region);
    }
  }
})
</script>

<style scoped>
.main {
  width: 100%;
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

.favourites-list > div:first-of-type, .favourite {
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

.favourite.history {
  cursor: pointer;
}

.favourite-name {
  font-weight: 400;
  width: 100%;
  margin-left: 10px;
}

.favourite-button {
  cursor: pointer;
}

.remove-button {
  min-width: 25px;
  min-height: 25px;
  width: 25px;
  height: 25px;
  font-size: 25px;
  font-weight: 600;
  line-height: 21px;
  text-align: center;
  border-radius: 50%;
  background-color: darkred;
  display: flex;
  justify-content: center;
  align-items: center;
}

/*noinspection CssUnusedSymbol*/
.add-button {
  min-width: 25px;
  min-height: 25px;
  width: 25px;
  height: 25px;
  font-size: 25px;
  font-weight: 600;
  line-height: 21px;
  text-align: center;
  border-radius: 50%;
  background-color: darkgreen;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-dash {
  width: 14px;
  height: 3px;
  background-color: white;
}

.add-dash {
  width: 14px;
  height: 3px;
  background-color: white;
  transform: rotate(90deg);
  position: absolute;
}

.drag-indicator {
  display: flex;
  flex-direction: row;
  padding: 0 10px;
  margin: 0 -10px;
  cursor: grab;
}

.arrows {
  display: flex;
  flex-direction: column;
  height: 32px;
  justify-content: center;
  font-size: 8px;
}
</style>
