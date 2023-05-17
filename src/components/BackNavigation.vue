<template>
  <div class="drag-handle" />
  <div class="back-navigation">
    <router-link to="/" class="link">
      <BackArrowIcon class="icon" />
    </router-link>
    <slot />
    <div />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackArrowIcon from "@/components/icons/BackArrowIcon.vue";

export default defineComponent({
  name: "BackNavigation.vue",
  components: {
    BackArrowIcon
  }
})
</script>

<style scoped>
.back-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding:calc(env(titlebar-area-height, 5px) + 10px) 0 15px 0;
  line-height: 20px;
  height: 40px;
  text-transform: uppercase;
  color: white;
  font-size: 12px;
  font-weight: normal;
}
.link {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 40px;
  max-width: 40px;
  height: 40px;
}
.back-navigation div {
  width: 40px; /* width of the arrow icon to center the slot */
}
.drag-handle {
    width: 100%;
    position: absolute;
    height: 0;
    padding: env(titlebar-area-height, 0) 0 0 0;
    -webkit-app-region: drag;
    app-region: drag;
}
</style>
