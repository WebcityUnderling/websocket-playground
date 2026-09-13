<template>
  <div class="container h-full flex justify-center items-center">
    <div
      class="max-w-125 w-full my-16 theme-light border border-(--theme-bg-complement) rounded-lg"
    >
      <h1>You entered a room!</h1>
      <form v-on:submit.prevent="handleClose()">
        <button
          type="submit"
          class="text-lg font-medium p-2 leding-none rounded-sm bg-(--theme-bg-complement) interactive w-full text-center"
        >
          Leave
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { useRoomStore } from "../store/roomStore";

const roomStore = useRoomStore();

function handleClose() {
  roomStore.leaveRoom();
}
</script>
