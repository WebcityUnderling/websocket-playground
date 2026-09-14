<template>
  <div v-bind="$attrs" class="text-center">
    <!-- Avatar -->
    <div class="text-2xl absolute -translate-x-1/2 -translate-y-3/4">
      {{ avatar }}
    </div>
    <!-- Name -->
    <span
      class="bg-(--theme-bg) border text-ellipsis overflow-hidden whitespace-nowrap max-w-32 border-current/30 block shadow-sm rounded-sm text-xs font-medium p-1"
      >{{ name }}</span
    >
  </div>
</template>
<script setup lang="ts">
defineProps<{
  name?: string | null;
  avatar?: string | null;
}>();
</script>
