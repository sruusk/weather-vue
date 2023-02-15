<template>
  <div class="settings">
    <SettingsItem :title="$t('settings.location')">
      <div>
        {{ $t('settings.on') }}
        <CheckboxItem
            @click="locationEnabled = true"
            :checked="locationEnabled" />
      </div>
      <div>
        {{ $t('settings.off') }}
        <CheckboxItem
            @click="locationEnabled = false"
            :checked="!locationEnabled" />
      </div>
    </SettingsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Settings from "@/settings";
import SettingsItem from "@/components/settings/SettingsItem.vue";
import CheckboxItem from "@/components/settings/CheckboxItem.vue";

export default defineComponent({
  name: "LocationSettings.vue",
  components: {
    SettingsItem,
    CheckboxItem
  },
  data() {
    return {
      locationEnabled: Settings.location,
    }
  },
  watch: {
    locationEnabled() {
      this.saveLocationSetting();
    }
  },
  methods: {
    saveLocationSetting() {
      Settings.location = this.locationEnabled;
    },
  }
})
</script>

<style scoped>

</style>
