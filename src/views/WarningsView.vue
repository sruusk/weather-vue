<!--suppress TypeScriptUnresolvedReference, ES6ShorthandObjectProperty, JSFunctionExpressionToArrowFunction -->
<template>
  <div class="warnings" :class="{ 'loading': loading }">
    <BackNavigation> {{ $t('routes.warnings') }} </BackNavigation>
    <orbit-spinner
        v-if="loading"
        class="spinner"
        :animation-duration="1200"
        :size="70"
        color="#62b8e7"
    />
    <div class="alert-client" ref="alertClient">
      <div id="alert-client-app" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useSettingsStore} from "@/stores";
import LICENSE from "@/assets/alert-client/LICENSE.txt";
import { OrbitSpinner } from 'epic-spinners'
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
      loading: true
    }
  },
  created() {
    console.info("smartmet-alert-client is licensed under the MIT License. See", LICENSE);

    setTimeout(() => {
      const lang = this.settingsStore.language;
      // @ts-ignore
      const day = this.$route.params.day || 0
      // @ts-ignore
      new Vue({
        el: '#alert-client-app', // @ts-ignore
        render: function(h) { // @ts-ignore
          return h(SmartMetAlertClient, {
            props: {
              language: lang,
              theme: 'dark',
              selectedDay: parseInt(day),
              staticDays: true,
              startFrom: 'updated',
              regionListEnabled: true
            }
          });
        }
      });
    }, 300); // Delay to allow the nav drawer to close

    this.waitForLoad();
  },
  activated() { // @ts-ignore
    if(!this.loading && this.$route.params.day) { // @ts-ignore
      const days = this.alertClient?.querySelectorAll(".nav-item > a"); // @ts-ignore
      if(days) days[this.$route.params.day].click();
    }
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
    }
  }
})
</script>

<style scoped>
.warnings {
  width: 100%;
}
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
}
.alert-client {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
