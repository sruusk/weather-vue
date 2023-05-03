<template>
  <div class="about">
    <BackNavigation>About</BackNavigation>
    <h1>INOP</h1>
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
.about h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
}
</style>
