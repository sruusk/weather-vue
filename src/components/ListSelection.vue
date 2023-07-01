<template>
  <div class="list">
    <div v-for="item in items" :key="item.name" class="item" @click="select(item)">
      <span>{{ item.name }}{{ item.state ? `, ${item.state}` : '' }}, {{ fullCountryName(item.country) }}</span>
      <div class="add-button">+</div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import countries from "i18n-iso-countries";
import {useSettingsStore} from "@/stores";

export default defineComponent({
  name: "ListSelection",
  props: {
    items: {
      type: Array as () => { name: string, lat: number, lon: number, country: string, state: string }[],
      required: true
    }
  },
  emits: ["select"],
  setup() {
    const settingsStore = useSettingsStore();
    return {
      settingsStore
    };
  },
  methods: {
    select(item: any) {
      this.$emit("select", item);
    },
    fullCountryName(countryCode: string) {
      return countries.getName(countryCode, this.settingsStore.language);
    }
  }
})
</script>

<style scoped>
.list {
  padding: 0 20px;
  margin-bottom: 40px;
}

.item {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--backgroundLight);
  color: white;
}

.item-info > span {
  margin-right: 10px;
}

.add-button {
  width: 25px;
  height: 25px;
  font-size: 25px;
  font-weight: 600;
  line-height: 23px;
  text-align: center;
  border-radius: 50%;
  background-color: darkgreen;
  margin: -5px 0;
}
</style>
