<template>
  <SettingsItem :title="$t('settings.weatherRadar')">
    <div @click="settingsStore.setWeatherRadar(true)">
      {{ $t('settings.on') }}
      <CheckboxItem :checked="settingsStore.weatherRadar" />
    </div>
    <div @click="settingsStore.setWeatherRadar(false)">
      {{ $t('settings.off') }}
      <CheckboxItem :checked="!settingsStore.weatherRadar" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useSettingsStore} from "@/stores";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "WeatherRadarSettings",
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
