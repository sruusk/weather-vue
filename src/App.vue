<template>
  <NavDrawer :open="drawerOpen" :is-installed="isInstalled()" @close="closeDrawer" @install="installPWA" />
  <RouterView @open="openDrawer" @click="handleClick" />
</template>

<script lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { defineComponent } from 'vue'
import NavDrawer from "@/components/NavDrawer.vue";

export default defineComponent({
  name: 'App',
  components: {
    RouterLink,
    RouterView,
    NavDrawer
  },
  data() {
    return {
      drawerOpen: false,
      deferredPrompt: null as any
    }
  },
  beforeCreate() {
    window.addEventListener('beforeinstallprompt', (e) => {
      this.deferredPrompt = e;
    });
  },
  created() {
    const language = localStorage.getItem('language');
    if (language) {
      this.$i18n.locale = language;
    }
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
  /*max-width: calc(100vh * 9/16);*/
}

body {
  margin: 0;
  padding: 0;
  background-color: #1d225c;
}
</style>
