<template>
  <InputGroup
    :inputID="props.id"
    :label="props.label"
    :error="props.error"
    :description="props.description"
  >
    <div class="block-input">
      <input
        v-bind="$attrs"
        class="h-10 rounded-sm bg-white text-lg border border-(--theme-bg-complement) w-full px-3"
        :id="props.id"
        :value="model"
        @input="model = $event?.target?.value"
        :aria-invalid="props.error && props.error.length ? 'true' : 'false'"
        :aria-errormessage="props.error ?? undefined"
        :aria-describedby="
          props.description ? `${props.id}-description` : undefined
        "
      />
    </div>
  </InputGroup>
</template>

<script setup lang="ts">
import InputGroup from "./InputGroup.vue";

interface Props {
  id: string;
  label: string;
  description?: string;
  error?: string;
}
const model = defineModel();
const props = defineProps<Props>();
</script>
