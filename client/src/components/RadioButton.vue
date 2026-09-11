<template>
  <div class="relative group">
    <input
      class="absolute size-full appearance-none pointer-events-none"
      :id="props.id"
      v-bind="$attrs"
      type="radio"
      @input="model = props.value"
    />
    <label
      :for="props.id"
      class="group-has-checked:bg-(--theme-bg-complement) interactive border border-(--theme-bg-complement) rounded-sm p-1.5 text-3xl block leading-none not-group-has-checked:hover:bg-(--theme-bg-complement)/50"
    >
      <slot v-if="$slots.label" name="label" />
      <span v-else>{{ props.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  id: string;
}
const model = defineModel();
const props = defineProps<Props>();
</script>
