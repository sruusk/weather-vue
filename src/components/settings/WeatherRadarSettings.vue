<template>
  <SettingsItem :title="$t('settings.weatherRadar')">
    <div>
      {{ $t('settings.on') }}
      <CheckboxItem
          @click="settingsStore.setWeatherRadar(true)"
          :checked="settingsStore.weatherRadar" />
    </div>
    <div>
      {{ $t('settings.off') }}
      <CheckboxItem
          @click="settingsStore.setWeatherRadar(false)"
          :checked="!settingsStore.weatherRadar" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useSettingsStore} from "@/stores";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "WeatherRadarSettings.vue",
  components: {
    SettingsItem,
    CheckboxItem
  },
  setup() {
    const settingsStore = useSettingsStore();
    return {
      settingsStore
    };
  },
})
</script>

<style scoped>

</style>
