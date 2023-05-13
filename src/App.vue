<template>
  <NavDrawer
      :open="drawerOpen"
      :is-installed="installed"
      @close="closeDrawer"
      @install="installPWA" />
  <RouterView
      @open="openDrawer"
      @click="handleClick"
      :class="{'open' : drawerOpen}"
      id="router-view" >
  </RouterView>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent } from 'vue'
import NavDrawer from "@/components/NavDrawer.vue";
import Settings from "@/settings";
import { useWeatherStore } from "@/stores";
import { useFavouritesStore } from "@/stores";

export default defineComponent({
  name: 'App',
  components: {
    RouterLink,
    RouterView,
    NavDrawer
  },
  setup() {
    const weatherStore = useWeatherStore();
    const favouritesStore = useFavouritesStore();
    return {
        weatherStore,
        favouritesStore
    };
  },
  data() {
    return {
      drawerOpen: false,
      deferredPrompt: null as any,
      installed: false
    }
  },
  beforeCreate() {
    window.addEventListener('beforeinstallprompt', (e) => {
      this.deferredPrompt = e;
    });
  },
  created() {
    this.$i18n.locale = Settings.language;
    this.favouritesStore.init();
    this.weatherStore.init();
  },
  mounted() {
    this.installed = this.isInstalled();
  },
  methods: {
    closeDrawer() {
      this.drawerOpen = false
    },
    openDrawer() {
      this.drawerOpen = !this.drawerOpen
    },
    handleClick() {
      if(this.drawerOpen) {
        this.closeDrawer()
      }
    },
    installPWA() {
      console.log('installing PWA');
      if(this.deferredPrompt && !this.isInstalled()) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.deferredPrompt = null;
        });
      }
    },
    isInstalled() {
      //@ts-ignore For iOS
      if(window.navigator.standalone) return true

      // For Android
      if(window.matchMedia('(display-mode: standalone)').matches) return true

      // If neither is true, it's not installed
      return false
    }
  }
})

</script>

<style scoped>

</style>

<style>
@font-face {
  font-family: "Roboto";
  font-weight: 100;
  src: local("Roboto Thin"), url("@/fonts/Roboto-Thin.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: 300;
  src: local("Roboto Light"), url("@/fonts/Roboto-Light.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: 500;
  src: local("Roboto Medium"), url("@/fonts/Roboto-Medium.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: normal;
  src: local("Roboto"), url("@/fonts/Roboto-Regular.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: bold;
  src: local("Roboto Bold"), url("@/fonts/Roboto-Bold.ttf") format("truetype");
}

/*noinspection CssUnusedSymbol*/
#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  overflow-x: clip;
  width: 100%;
  max-width: calc(3/4 * 100vh);
  background-color: #1d225c;
}

/*noinspection CssUnusedSymbol*/
#app .open { /* Prevent scrolling when navigation is open */
  overflow-y: clip;
  max-height: 100vh;
}

#router-view {
  contain: content;
}

body {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1e1e1e;
}
</style>
