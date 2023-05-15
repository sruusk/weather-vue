<template>
  <SettingsItem :title="$t('settings.language')">
    <div>
      Suomeksi
      <CheckboxItem
          @click="settingsStore.setLanguage('fi')"
          :checked="settingsStore.language === 'fi'"/>
    </div>
    <div>
      På svenska
      <CheckboxItem
          @click="settingsStore.setLanguage('sv')"
          :checked="settingsStore.language === 'sv'" />
    </div>
    <div>
      In English
      <CheckboxItem
          @click="settingsStore.setLanguage('en')"
          :checked="settingsStore.language === 'en'" />
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
