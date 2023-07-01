<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.forecastInterval')">
      <div @click="settingsStore.setForecastInterval(1)">
        {{ $t('settings.oneHour') }}
        <CheckboxItem :checked="settingsStore.forecastInterval === 1"/>
      </div>
      <div @click="settingsStore.setForecastInterval(3)">
        {{ $t('settings.threeHours') }}
        <CheckboxItem :checked="settingsStore.forecastInterval === 3"/>
      </div>
    </SettingsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";
import {useSettingsStore} from "@/stores";

export default defineComponent({
  name: "ForecastSettings",
  components: {
    SettingsItem,
    CheckboxItem
  },
  setup() {
    const settingsStore = useSettingsStore();
    return {
      settingsStore,
    };
  },
})
</script>

<style scoped>

</style>
