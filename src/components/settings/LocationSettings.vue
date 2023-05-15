<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.location')">
      <div>
        {{ $t('settings.on') }}
        <CheckboxItem
            @click="settingsStore.setUseLocation(true)"
            :checked="settingsStore.useLocation" />
      </div>
      <div>
        {{ $t('settings.off') }}
        <CheckboxItem
            @click="settingsStore.setUseLocation(false)"
            :checked="!settingsStore.useLocation" />
      </div>
    </SettingsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useSettingsStore} from "@/stores";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "LocationSettings.vue",
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
