<template>
  <div :style="{ height: footerHeight }" />
  <div class="footer" ref="footer">
    <FMIOpenDataIcon class="logo" />
    <div class="disclaimer">{{ $t('home.weatherProvider') }}</div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import FMIOpenDataIcon from "@/components/icons/FMIOpenDataIcon.vue";

export default defineComponent({
  name: "Footer.vue",
  components: {
    FMIOpenDataIcon
  },
  setup() {
    const footer = ref(null);
    return {
      footer
    }
  },
  computed: {
    footerHeight() {
      // @ts-ignore
      return this.footer ? this.footer.scrollHeight + "px" : "0px";
    }
  }
})
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  padding: 10px;
  align-items: center;
  background-color: var(--backgroundLight);
  flex-direction: column;
  position: absolute;
  bottom: 0;
  width: 100%;
}
.logo {
  height: 84px;
  width: 200px
}
.disclaimer {
  color: gray;
  font-size: 12px;
}
</style>
