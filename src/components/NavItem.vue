<template>
  <router-link :exact="false" :to="{ name: to }" active-class="activeClass" class="link">
    <slot/>
    <MenuArrowIcon class="icon"/>
  </router-link>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
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
  align-items: center;
  padding: 17px 0;
  margin: 0 20px;
  color: #fff;
  text-decoration: none;
  font-weight: 400;
  font-size: 16px;
  transition: background-color 0.3s ease-in-out;
  border-top: var(--backgroundLight) solid 1px;
  white-space: nowrap;
}

.link:last-of-type {
  border-bottom: var(--backgroundLight) solid 1px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-top: 2px; /* align with text because the icon is not perfectly centered */
}
</style>
