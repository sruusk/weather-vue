<template>
  <div class="nav-drawer" :class="open ? 'open' : 'closed'">
    <FMIOpenDataIcon class="logo" />
    <NavItem v-for="route in routes" :to="route.path" @click="close">{{ $t(`routes.${route.name}`) }}</NavItem>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavItem from "@/components/NavItem.vue";
import { routes } from '@/router';
import FMIOpenDataIcon from "@/components/icons/FMIOpenDataIcon.vue";

export default defineComponent({
  name: "NavDrawer",
  components: {
    NavItem,
    FMIOpenDataIcon,
  },
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  computed: {
    routes() {
      return routes.filter(route => route.showInMenu)
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
});
</script>

<!--suppress CssUnusedSymbol -->
<style scoped>
.nav-drawer {
  position: relative;
  top: 0;
  left: 0;
  bottom: 0;
  width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1f2566;
  box-shadow: inset 0 0 20px #161e4d;
  z-index: 100;
  transition: min-width 0.3s ease-in-out;
  overflow: hidden;
  text-wrap: none;
}
.nav-drawer.open {
  min-width: 80vw;
}
.nav-drawer.closed {
  min-width: 0;
}
.logo {
  width: 80vw;
  height: 50px;
  padding: 20px 0 20px 0;
  background: #253478;
  box-shadow: #161e4d 0 0 20px;
  margin-bottom: 40px;
}
</style>
