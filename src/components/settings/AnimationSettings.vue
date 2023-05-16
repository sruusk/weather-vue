<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.animatedSymbols')">
      <div>
        {{ $t('settings.on') }}
        <CheckboxItem
            @click="settingsStore.setUseAnimations(true)"
            :checked="settingsStore.useAnimations" />
      </div>
      <div>
        {{ $t('settings.off') }}
        <CheckboxItem
            @click="settingsStore.setUseAnimations(false)"
            :checked="!settingsStore.useAnimations" />
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
