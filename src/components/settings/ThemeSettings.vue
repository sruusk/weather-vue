<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.theme.theme')">
      <div v-for="theme in themeStore.themes" @click="settingsStore.setTheme(theme.name)">
        {{ $t(`settings.theme.${theme.name}`) }}
        <ThemeCheckbox
            :checked="settingsStore.theme === theme.name"
            :color="theme.colours.backgroundLight"
        />
      </div>
    </SettingsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SettingsItem from "@/components/settings/SettingsItem.vue";
import ThemeCheckbox from "@/components/settings/ThemeCheckbox.vue";
import {useSettingsStore, useThemeStore} from "@/stores";

export default defineComponent({
    name: "ThemeSettings",
    components: {
        SettingsItem,
        ThemeCheckbox
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
