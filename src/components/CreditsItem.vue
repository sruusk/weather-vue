<template>
  <div class="credits-item">
    <div class="title">
      {{ title }}
    </div>
    <div class="content">
      {{ content }}
    </div>
    <div class="image">
      <slot/>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "CreditsItem",
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
})
</script>

<style scoped>
.credits-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 15px 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  contain: content;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  color: white;
}

.content {
  font-size: 16px;
  font-weight: 500;
  margin: 20px 0 0 0;
  padding: 0;
  color: white;
}

.image {
  margin: 1rem 0 0 0;
  height: 70px;
  display: flex;
  flex-direction: column;
}

:deep(.image svg) {
  width: 200px;
}

:deep(.image img) {
  width: 200px;
}
</style>
