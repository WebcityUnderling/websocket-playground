<template>
  <div class="w-full pt-[100%] bg-(--theme-bg-complement)" ref="stage"></div>
</template>

<script setup>
import { createCursorEngine } from "../utils/cursorEngine.ts";

if (!window.curorEngine) {
  window.cursorEngine = createCursorEngine();
}

console.log(window.cursorEngine);
</script>
