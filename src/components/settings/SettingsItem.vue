<template>
  <div class="settings">
    <div class="title">
      {{ title }}
    </div>
    <div class="content">
      <slot class="slot" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "SettingsItem",
  props: {
    title: String
  }
})
</script>

<style scoped>
.settings {
  margin: 0;
}
.content {
  background-color: var(--backgroundSettingsItem);
}
:slotted(.content > div) {
  margin: 0 10px 0 10px;
  padding: 17px 10px;
  background-color: var(--backgroundSettingsItem);
  border-bottom: var(--backgroundLight) 1px solid;
  color: white;
  font-size: 13px;
  font-weight: 300;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:slotted(.content > div:last-child) { /* remove the border from the last child */
  border-bottom: none;
}
.title {
  text-transform: uppercase;
  font-size: 12px;
  font-weight: normal;
  color: white;
  width: 100%;
  padding: 15px 10px;
}
</style>
