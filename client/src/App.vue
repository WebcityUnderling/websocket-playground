<template>
  <main class="min-h-dvh h-dvh">
    <KeepAlive>
      <Lobby
        v-if="roomStore.status != 'joined'"
        :selectable-avatars="usableAvatars"
      />
    </KeepAlive>
    <Room v-if="roomStore.status == 'joined'" />
  </main>
</template>

<script setup>
import Lobby from "./components/Lobby.vue";
import Room from "./components/Room.vue";
import { usableAvatars } from "./data/avatars.ts";
import { useRoomStore } from "./store/roomStore.ts";

const roomStore = useRoomStore();
</script>
