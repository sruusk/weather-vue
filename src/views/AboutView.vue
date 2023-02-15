<template>
  <div class="about">
    <BackNavigation>About</BackNavigation>
    <h1>This is an about page that has not been implemented yet.</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackNavigation from "@/components/BackNavigation.vue";

export default defineComponent({
  name: "AboutView",
  components: {
    BackNavigation,
  },
});
</script>

<style>
.about {
  width: 100%;
}
</style>
