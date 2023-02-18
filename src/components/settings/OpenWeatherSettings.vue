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
    <div>
      {{ $t('settings.getPop') }}
      <CheckboxItem
        @click="getPop = !getPop"
        :checked="getPop" />
    </div>
    <div>
      {{ $t('settings.getLongerForecast') }}
      <CheckboxItem
        @click="getLongerForecast = !getLongerForecast"
        :checked="getLongerForecast" />
    </div>
  </SettingsItem>
  <SettingsItem :title="'OpenWeather OneCall API'">
    <div>
      {{ $t('settings.on') }}
      <CheckboxItem
          @click="oneCallEnabled = true"
          :checked="oneCallEnabled" />
    </div>
    <div>
      {{ $t('settings.off') }}
      <CheckboxItem
          @click="oneCallEnabled = false"
          :checked="!oneCallEnabled" />
    </div>
    <div>
      {{ $t('settings.getWarnings') }}
      <CheckboxItem
        @click="getWarnings = !getWarnings"
        :checked="getWarnings" />
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
      apiKey: Settings.openWeatherApiKey,
      oneCallEnabled: Settings.useOneCall,
      getPop: Settings.getPop,
      getLongerForecast: Settings.getLongerForecast,
      getWarnings: Settings.getWarnings
    }
  },
  watch: {
    openWeatherEnabled() {
      Settings.useOpenWeather = this.openWeatherEnabled;
    },
    apiKey() {
      Settings.openWeatherApiKey = this.apiKey;
    },
    getPop() {
      Settings.getPop = this.getPop;
    },
    getLongerForecast() {
      Settings.getLongerForecast = this.getLongerForecast;
    },
    oneCallEnabled() {
      Settings.useOneCall = this.oneCallEnabled;
    },
    getWarnings() {
      Settings.getWarnings = this.getWarnings;
    }
  },
})
</script>

<style scoped>

</style>
