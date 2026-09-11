<template>
  <component :is="groupElement">
    <component
      :is="labelElement"
      :for="!props.fieldset ? props.inputID : undefined"
      class="text-sm font-medium"
      :class="{ required: props.required || !!isRequired }"
      >{{ label }}</component
    >
    <slot />
    <div>
      <p v-if="props.error">
        {{ props.error }}
      </p>
      <p :id="`${props.inputID}-description`" v-html="props.description"></p>
    </div>
  </component>
</template>

<script setup lang="ts">
import { useAttrs } from "vue";
type LabelElement = "label" | "legend";
type GroupElement = "div" | "fieldset";

interface Props {
  inputID?: string;
  label: string;
  error?: string;
  description?: string;
  fieldset?: boolean;
  required?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const attributes = useAttrs();

const isRequired = attributes?.["aria-required"] || attributes?.required;

const props = withDefaults(defineProps<Props>(), {
  fieldset: false,
});

const labelElement: LabelElement = props.fieldset ? "legend" : "label";
const groupElement: GroupElement = props.fieldset ? "fieldset" : "div";
</script>
<style scoped>
.required::after {
  @apply content-['*'];
}
</style>
