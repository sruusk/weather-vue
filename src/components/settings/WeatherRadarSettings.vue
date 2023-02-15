<template>
  <SettingsItem :title="$t('settings.weatherRadar')">
    <div>
      {{ $t('settings.on') }}
      <CheckboxItem
          @click="weatherRadarEnabled = true"
          :checked="weatherRadarEnabled" />
    </div>
    <div>
      {{ $t('settings.off') }}
      <CheckboxItem
          @click="weatherRadarEnabled = false"
          :checked="!weatherRadarEnabled" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Settings from "@/settings";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "WeatherRadarSettings.vue",
  components: {
    SettingsItem,
    CheckboxItem
  },
  data() {
    return {
      weatherRadarEnabled: Settings.weatherRadar,
    }
  },
  watch: {
    weatherRadarEnabled() {
      Settings.weatherRadar = this.weatherRadarEnabled;
    }
  },
})
</script>

<style scoped>

</style>
