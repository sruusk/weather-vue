<template>
  <div class="footer">
    <IconFMIOpenData class="logo" />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import IconFMIOpenData from "@/components/icons/IconFMIOpenData.vue";

export default defineComponent({
  name: "Footer.vue",
  components: {
    IconFMIOpenData
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
