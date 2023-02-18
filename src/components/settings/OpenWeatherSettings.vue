<template>
  <SettingsItem :title="'OpenWeather'">
    <div>
      {{ $t('settings.on') }}
      <CheckboxItem
          @click="openWeatherEnabled = true"
          :checked="openWeatherEnabled" />
    </div>
    <div>
      {{ $t('settings.off') }}
      <CheckboxItem
          @click="openWeatherEnabled = false"
          :checked="!openWeatherEnabled" />
    </div>
    <div>
      OpenWeather {{ $t('settings.apiKey') }}
      <TextInputItem v-model:value="apiKey" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Settings from "@/settings";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";
import TextInputItem from "@/components/settings/TextInputItem.vue";

export default defineComponent({
  name: "OpenWeatherSettings",
  components: {
    SettingsItem,
    CheckboxItem,
    TextInputItem
  },
  data() {
    return {
      openWeatherEnabled: Settings.useOpenWeather,
      apiKey: Settings.openWeatherApiKey
    }
  },
  watch: {
    openWeatherEnabled() {
      Settings.useOpenWeather = this.openWeatherEnabled;
    },
    apiKey() {
      Settings.openWeatherApiKey = this.apiKey;
    }
  },
})
</script>

<style scoped>

</style>
