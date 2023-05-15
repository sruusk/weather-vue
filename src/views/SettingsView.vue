<template>
  <div class="settings">
    <BackNavigation>{{ $t('settings.settings') }}</BackNavigation>
    <LanguageSettings />
    <LocationSettings />
    <WeatherRadarSettings />
    <ThemeSettings />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BackNavigation from "@/components/BackNavigation.vue";
import LanguageSettings from "@/components/settings/LanguageSettings.vue";
import LocationSettings from "@/components/settings/LocationSettings.vue";
import WeatherRadarSettings from "@/components/settings/WeatherRadarSettings.vue";
import ThemeSettings from "@/components/settings/ThemeSettings.vue";

export default defineComponent({
  name: "SettingsView",
  components: {
    ThemeSettings,
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
