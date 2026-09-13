<template>
  <div class="container h-full flex justify-center items-center">
    <div
      class="max-w-125 w-full my-16 theme-light border border-(--theme-bg-complement) rounded-lg p-8 space-y-5"
    >
      <Stage />
      <form v-on:submit.prevent="handleClose()">
        <Submit>Leave</Submit>
      </form>
    </div>
  </div>
</template>
<script setup>
import { useRoomStore } from "../store/roomStore";
import Submit from "./Submit.vue";
import Stage from "./Stage.vue";

const roomStore = useRoomStore();

function handleClose() {
  roomStore.leaveRoom();
}
</script>
