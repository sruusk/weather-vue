<!--suppress TypeScriptUnresolvedReference, ES6ShorthandObjectProperty, JSFunctionExpressionToArrowFunction -->
<template>
  <div :class="{ 'loading': loading }" class="warnings">
    <BackNavigation> {{ $t('routes.warnings') }}</BackNavigation>
    <orbit-spinner
      v-if="loading"
      :animation-duration="1200"
      :size="70"
      class="spinner"
      color="#62b8e7"
    />
    <div ref="alertClient" :style="loading ? 'filter: blur(5px) brightness(0.3) saturate(0.5);' : ''"
         class="alert-client">
      <div id="alert-client-app"/>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useSettingsStore} from "@/stores";
// @ts-ignore
import {OrbitSpinner} from 'epic-spinners'
import BackNavigation from "@/components/BackNavigation.vue";
import "@/assets/alert-client/vue.js";
import "@/assets/alert-client/SmartMetAlertClient.umd.js";
import "@/assets/alert-client/SmartMetAlertClient.css";

export default defineComponent({
  name: "WarningsView",
  components: {
    BackNavigation,
    OrbitSpinner
  },
  setup() {
    const alertClient = ref(null);
    const settingsStore = useSettingsStore();
    return {
      alertClient,
      settingsStore
    };
  },
  data() {
    return {
      loading: true,
      vue: null
    }
  },
  created() {
    setTimeout(this.create, 300); // Delay to allow the nav drawer to close
    this.waitForLoad();
  },
  activated() { // @ts-ignore
    if (!this.loading && this.$route.params.day) { // @ts-ignore
      const days = this.alertClient?.querySelectorAll(".nav-item > a"); // @ts-ignore
      if (days) days[this.$route.params.day].click();
    }
  },
  watch: {
    "settingsStore.language": function () {
      // @ts-ignore
      this.vue.lang = this.settingsStore.language;
    },
  },
  methods: {
    waitForLoad() {
      setTimeout(() => {
        // @ts-ignore
        if (this.alertClient?.querySelector(".warning-map-status > p > span:nth-child(3)")?.innerText.length > 0) {
          this.loading = false;
        } else {
          this.waitForLoad();
        }
      }, 500);
    },
    create() {
      const data = {
        lang: this.settingsStore.language, // @ts-ignore
        day: parseInt(this.$route.params.day || 0)
      }
      // @ts-ignore
      this.vue = new Vue({
        el: '#alert-client-app', // @ts-ignore
        data: data,
        render: function (h: any) { // @ts-ignore
          return h(SmartMetAlertClient, {
            props: {
              language: this.lang,
              theme: 'dark',
              selectedDay: this.day,
              staticDays: true,
              startFrom: 'updated',
              regionListEnabled: true
            }
          });
        }
      });
    }
  }
})
</script>

<style scoped>
.warnings {
  width: 100%;
}

/*noinspection CssUnusedSymbol*/
.loading {
  max-height: 100vh;
}

.warnings h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
  color: white;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  padding: 1rem;
}

.alert-client {
  width: 100%;
  display: flex;
  justify-content: center;
}

.alert-client :deep(h3),
.alert-client :deep(nav) {
  margin-left: 10px !important;
}
</style>
