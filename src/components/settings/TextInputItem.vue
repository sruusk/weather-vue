<template>
  <div class="input-item">
    <input :value="value" type="text" @input="updateValue"/>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: "TextInputItem",
  emits: ['update:value'],
  props: {
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    updateValue(event: any) {
      // @ts-ignore
      this.$emit('update:value', event.target.value)
    }
  }
})
</script>

<style scoped>
.input-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

input {
  width: 100%;
  padding: 5px;
  margin: -10px 0;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-family: inherit;
  box-sizing: border-box;
}
</style>
