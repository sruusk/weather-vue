<template>
  <router-link :to="to" :exact="false" active-class="activeClass" class="link">
    <slot />
    <MenuArrowIcon />
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MenuArrowIcon from "@/components/icons/MenuArrowIcon.vue";

export default defineComponent({
  name: "NavItem.vue",
  components: {
    MenuArrowIcon
  },
  props: {
    to: {
      type: String,
      required: true,
    }
  }
})
</script>

<style scoped>
.link {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  margin: 0 20px -1px 20px;
  color: #fff;
  text-decoration: none;
  font-weight: 300;
  font-size: 1.2rem;
  transition: background-color 0.3s ease-in-out;
  border-top: #2b4294 solid 1px;
  border-bottom: #2b4294 solid 1px;
  white-space: nowrap;
}
</style>
