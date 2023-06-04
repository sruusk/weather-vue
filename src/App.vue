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
      v-slot="{ Component }"
      id="router-view" >
    <keep-alive :include="['HomeView', 'WarningsView']">
      <component :is="Component" />
    </keep-alive>
  </RouterView>
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent } from 'vue'
import NavDrawer from "@/components/NavDrawer.vue";
import { useWeatherStore, useFavouritesStore, useSettingsStore, useThemeStore, useAlertsStore } from "@/stores";

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
    const settingsStore = useSettingsStore();
    const themeStore = useThemeStore();
    return {
        weatherStore,
        favouritesStore,
        settingsStore,
        themeStore,
    };
  },
  data() {
    return {
      drawerOpen: false,
      deferredPrompt: null as any,
      installed: false,
      colour: 'red',
    }
  },
  beforeCreate() {
    window.addEventListener('beforeinstallprompt', (e) => {
      this.deferredPrompt = e;
    });
    window.addEventListener('appinstalled', () => {
      this.installed = true;
      localStorage.setItem('installed', 'true');
    });
    this.installed = localStorage.getItem('installed') === 'true';
  },
  created() {
    this.themeStore.setTheme(this.settingsStore.theme);
    this.$i18n.locale = this.settingsStore.language;
    if(navigator.onLine) {
      this.favouritesStore.init();
      this.weatherStore.init();
    }
    else window.addEventListener('online', () => {
      this.favouritesStore.init();
      this.weatherStore.init();
    }, { once: true });

    useAlertsStore().init();
  },
  mounted() {
    if(!this.installed) this.installed = this.isInstalled();
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

      // For Chromium on Windows
      if(window.matchMedia('(display-mode: window-controls-overlay)').matches) return true

      // If neither is true, it's not installed
      return false
    }
  }
})

</script>

<style>
@font-face {
  font-family: "Roboto";
  font-weight: 100;
  src: local("Roboto Thin"), url("@/assets/fonts/Roboto-Thin.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: 300;
  src: local("Roboto Light"), url("@/assets/fonts/Roboto-Light.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: 500;
  src: local("Roboto Medium"), url("@/assets/fonts/Roboto-Medium.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: normal;
  src: local("Roboto"), url("@/assets/fonts/Roboto-Regular.ttf") format("truetype");
}
@font-face {
  font-family: "Roboto";
  font-weight: bold;
  src: local("Roboto Bold"), url("@/assets/fonts/Roboto-Bold.ttf") format("truetype");
}

/*noinspection CssUnusedSymbol*/
#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  overflow-x: clip;
  width: 100%;
  max-width: calc(max(3/4 * 100vh, 600px));
  background-color: var(--background);

  /* Default theme to help the editor resolve the variables */
  --background: #1d225c;
  --backgroundDark: #1d2e5d;
  --backgroundDarker: #111a2e;
  --backgroundDarkest: #111a2d;
  --backgroundLight: #274498;
  --backgroundLighter: #3559b9;
  --backgroundLightest: #5582cd;
  --backgroundGradient: linear-gradient(200deg,#5582cd 0%,#242282 100%);
  --backgroundMediumLight: #253e80;
  --backgroundObservations: linear-gradient(180deg, #456fc8 0%, #242282 100%);
  --backgroundSettingsItem: #253478;
  --selectedLight: #243f82;
}

/*noinspection CssUnusedSymbol*/
#app .open { /* Prevent scrolling when navigation is open */
  overflow-y: clip;
  max-height: 100vh;
}

#router-view {
  contain: content;
  min-width: 100%;
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
