<template>
  <div class="settings">
    <BackNavigation>{{ $t('settings.settings') }}</BackNavigation>
    <LanguageSettings />
    <LocationSettings />
    <WeatherRadarSettings />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";
import LanguageSettings from "@/components/settings/LanguageSettings.vue";
import LocationSettings from "@/components/settings/LocationSettings.vue";
import WeatherRadarSettings from "@/components/settings/WeatherRadarSettings.vue";

export default defineComponent({
  name: "SettingsView",
  components: {
    BackNavigation,
    LanguageSettings,
    LocationSettings,
    WeatherRadarSettings,
  }
})
</script>

<style scoped>
.settings {
  width: 100%;
  contain: content;
}
</style>
