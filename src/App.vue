<template>
  <NavDrawer :open="drawerOpen" @close="closeDrawer" />
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
      drawerOpen: false
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
