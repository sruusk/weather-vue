<template>
  <SettingsItem :title="$t('settings.language')">
    <div>
      Suomeksi
      <CheckboxItem
          @click="changeLanguage('fi')"
          :checked="language === 'fi'"/>
    </div>
    <div>
      På svenska
      <CheckboxItem
          @click="changeLanguage('sv')"
          :checked="language === 'sv'" />
    </div>
    <div>
      In English
      <CheckboxItem
          @click="changeLanguage('en')"
          :checked="language === 'en'" />
    </div>
  </SettingsItem>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Settings from "@/settings";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "LanguageSettings.vue",
  components: {
    SettingsItem,
    CheckboxItem
  },
  data() {
    return {
      language: Settings.language
    }
  },
  methods: {
    changeLanguage(language: string) {
      this.language = language;
      this.$i18n.locale = language;
      Settings.language = language;
    }
  }
})
</script>

<style scoped>

</style>
