<template>
  <div
    ref="stage"
    class="relative w-full pt-[100%] overflow-hidden bg-(--theme-bg-complement) cursor-none"
    @mouseenter="cursorVisible = true"
    @mouseleave="cursorVisible = false"
  >
    <!-- Other sessions use the latest positions received from the server. -->
    <UserDisplay
      v-for="session in otherSessions"
      :key="session.broadcastId"
      :name="session.name"
      :avatar="session.avatar"
      class="pointer-events-none absolute top-0 left-0"
      :style="{
        transform: `translate(${session.position.x}px, ${session.position.y}px)`,
      }"
    />

    <!-- Display Client Cursor -->
    <UserDisplay
      v-show="cursorVisible"
      :name="roomStore.userData?.name"
      :avatar="roomStore.userData?.avatar"
      aria-hidden="true"
      class="pointer-events-none absolute top-0 left-0"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { createCursorEngine } from "../utils/cursorEngine";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoomStore } from "../store/roomStore";
import { usableAvatars } from "../data/avatars";
import UserDisplay from "./UserDisplay.vue";
import { broadcastCoords } from "../services/roomConnection.ts";
import { throttle } from "lodash";

const stage = ref<HTMLDivElement | null>(null);
const cursorVisible = ref(false);
const position = ref({ x: 0, y: 0 });
const roomStore = useRoomStore();
const otherSessions = computed(() =>
  Object.entries(roomStore.sessions)
    .filter(([id]) => id !== roomStore.broadcastId)
    .map(([broadcastId, session]) => ({
      broadcastId,
      name: session.name,
      position: session.position,
      avatar:
        usableAvatars.find((avatar) => avatar.alias === session.avatar)?.icon ??
        "",
    })),
);

let engine: ReturnType<typeof createCursorEngine> | undefined;
let unsubscribe: (() => void) | undefined;

onMounted(() => {
  const cursorEngine = createCursorEngine();
  engine = cursorEngine;
  unsubscribe = cursorEngine.subscribe(({ targetX, targetY, idle }) => {
    const bounds = stage.value?.getBoundingClientRect();
    if (
      bounds &&
      targetX >= bounds.left &&
      targetX < bounds.right &&
      targetY >= bounds.top &&
      targetY < bounds.bottom
    ) {
      const x = targetX - bounds.left;
      const y = targetY - bounds.top;
      if (x !== position.value.x || y !== position.value.y) {
        position.value = { x, y };
      }
    }

    if (idle) cursorEngine.requestStop();
  });
});

const sendPosition = throttle(broadcastCoords, 50);

onUnmounted(() => {
  unsubscribe?.();
  engine?.destroy();
  sendPosition.cancel();
});

watch(position, (value) => {
  sendPosition(value);
});
</script>
