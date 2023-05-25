<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.animatedSymbols')">
      <div @click="settingsStore.setUseAnimations(true)">
        {{ $t('settings.on') }}
        <CheckboxItem :checked="settingsStore.useAnimations" />
      </div>
      <div @click="settingsStore.setUseAnimations(false)">
        {{ $t('settings.off') }}
        <CheckboxItem :checked="!settingsStore.useAnimations" />
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
    name: "ThemeSettings.vue",
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
