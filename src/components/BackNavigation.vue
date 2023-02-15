<template>
  <div class="back-navigation">
    <router-link to="/">
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
  margin: 15px 0;
  line-height: 20px;
  height: 40px;
  text-transform: uppercase;
  color: white;
  font-size: 12px;
  font-weight: normal;
}
.icon {
  padding: 20px;
}
.back-navigation div {
  width: 40px; /* width of the arrow icon to center the slot */
}
</style>
