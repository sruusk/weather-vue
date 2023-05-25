<template>
  <SettingsItem :title="$t('settings.language')">
    <div @click="settingsStore.setLanguage('fi')">
      Suomeksi
      <CheckboxItem :checked="settingsStore.language === 'fi'"/>
    </div>
    <div @click="settingsStore.setLanguage('sv')">
      På svenska
      <CheckboxItem :checked="settingsStore.language === 'sv'" />
    </div>
    <div @click="settingsStore.setLanguage('en')">
      In English
      <CheckboxItem :checked="settingsStore.language === 'en'" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useSettingsStore} from "@/stores";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "LanguageSettings.vue",
  components: {
    SettingsItem,
    CheckboxItem
  },
  setup() {
    const settingsStore = useSettingsStore();
    return {
      settingsStore
    };
  }
})
</script>

<style scoped>

</style>
