<template>
<div class="licenses">
  <BackNavigation>{{ $t('routes.licenses') }}</BackNavigation>
  <div class="license" v-for="license in licenses" :key="license.name">
    <h2>{{ license.name }} - {{ license.version }}</h2>
    <!--suppress TypeScriptUnresolvedReference -->
    <p class="type">{{ license.license }}</p>
    <p>{{ license.text }}</p>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackNavigation from "@/components/BackNavigation.vue";
import licenses from "@/assets/licenses.json";

export default defineComponent({
  name: "LicensesView",
  components: {
    BackNavigation,
  },
  setup() {
    return {
      licenses,
    };
  },
});

</script>

<style scoped>

.licenses {
  min-width: 100%;
}

.licenses h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
  color: white;
}

.licenses .type {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
  color: white;
}

.licenses p {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: left;
  color: white;
}

.licenses a {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
  color: white;
}

.licenses .license {
  margin: 0 0 1rem 0;
  padding: 0 20px 0 20px;
}

</style>
