<template>
  <div class="nav-drawer" :class="open ? 'open' : 'closed'">
    <div class="header">
      <FMIOpenDataIcon class="logo" />
    </div>
    <NavItem
      v-for="route in routes"
      :to="route.name"
      @click="close"
    >
      {{ $t(`routes.${route.name}`) }}
    </NavItem>
    <NavItem
      to="home"
      v-if="!isInstalled"
      @click="$emit('install')"
    >
      {{ $t("routes.install") }}
    </NavItem>
    <div class="footer">
      <span class="version">{{ $t("version") }}: {{ EXECUTION_NUMBER || "dev" }}</span>
    </div>
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
    isInstalled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "install"],
  data() {
    return {
      EXECUTION_NUMBER: import.meta.env.VITE_EXECUTION_NUMBER,
    };
  },
  computed: {
    routes() {
      return routes.filter(route => route.showInMenu)
    },
  },
  methods: {
    close() {
      this.$emit("close");
    }
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
  background-color: var(--backgroundDark);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
  transition: min-width 0.3s ease-out;
  overflow: hidden;
  text-wrap: none;
  z-index: 1100;
  contain: content;
}
.nav-drawer.open {
  min-width: calc(min(80vw, max(3/4 * 100vh, 600px) * 0.8));
}
.nav-drawer.closed {
  min-width: 0;
}
.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 10px 0 10px;
  background: var(--backgroundMediumLight);
  box-shadow: rgba(0, 0, 0, 0.3) 0 0 20px;
  margin-bottom: 40px;
  height: 80px;
}
.logo {
  min-width: 200px;
  width: 200px;
  height: 30px;
}
.footer {
  position: absolute;
  bottom: 0;
  min-width: calc(min(80vw, max(3/4 * 100vh, 600px) * 0.8));
  left: 0;
  right: 0;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  text-transform: capitalize;
}
.version {
  color: lightgray;
  font-size: 0.8em;
}
</style>
