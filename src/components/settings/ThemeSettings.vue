<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.theme.theme')">
      <div v-for="theme in themeStore.themes">
        {{ $t(`settings.theme.${theme.name}`) }}
        <CheckboxItem
            @click="settingsStore.setTheme(theme.name)"
            :checked="settingsStore.theme === theme.name" />
      </div>
    </SettingsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";
import {useSettingsStore, useThemeStore} from "@/stores";

export default defineComponent({
    name: "ThemeSettings.vue",
    components: {
        SettingsItem,
        CheckboxItem
    },
    setup() {
        const settingsStore = useSettingsStore();
        const themeStore = useThemeStore();
        return {
            settingsStore,
            themeStore
        };
    },
})
</script>

<style scoped>

</style>
