<template>
  <div class="footer">
    <FMIOpenDataIcon class="logo" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import FMIOpenDataIcon from "@/components/icons/FMIOpenDataIcon.vue";

export default defineComponent({
  name: "Footer.vue",
  components: {
    FMIOpenDataIcon
  }
})
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: #303193;
}
.logo {
  height: 100px;
  width: 200px
}
</style>
