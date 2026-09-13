<template>
  <div class="container h-full flex justify-center items-center">
    <div
      class="max-w-125 w-full my-16 theme-light border border-(--theme-bg-complement) rounded-lg"
    >
      <h1
        class="text-xs font-bold px-8 py-3 border-b border-(--theme-bg-complement)"
      >
        Enter details
      </h1>
      <form
        action=""
        v-on:submit.prevent="(e) => handleLobbySubmission(e)"
        class="space-y-6 p-8"
      >
        <Input
          v-model="roomCode"
          type="password"
          name="roomCode"
          label="Room Code"
          id="lobby-code"
          required
          value="MEGAPORT"
        />

        <Input
          name="name"
          v-model="name"
          label="Name"
          id="lobby-name-select"
          value="Sarah"
          required
        />

        <InputGroup label="Choose avatar" id="avatar" fieldset required>
          <div class="flex gap-1 justify-between">
            <RadioButton
              v-for="(avatar, i) in selectableAvatars"
              :required="i === 0"
              :checked="i === 0"
              :id="`avatar-${i}`"
              :label="avatar.icon"
              :value="avatar.alias"
              name="avatar"
              v-model="selectedAvatar"
            />
          </div>
        </InputGroup>
        <div
          v-if="lobbyErrors.length || roomStore.error"
          role="alert"
          class="callout border-red bg-red/10 text-base02"
        >
          <p v-for="error in lobbyErrors">{{ error }}</p>
          <p v-if="roomStore.error">{{ roomStore.error }}</p>
        </div>

        <Submit>Enter</Submit>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import Input from "./Input.vue";
import InputGroup from "./InputGroup.vue";
import RadioButton from "./RadioButton.vue";
import Submit from "./Submit.vue";
import type { Avatar } from "../data/avatars";
import { ref } from "vue";
import { useRoomStore } from "../store/roomStore.ts";

const roomStore = useRoomStore();

const props = defineProps<{
  selectableAvatars: readonly Avatar[];
}>();

const roomCode = ref("");
const name = ref("");
const selectedAvatar = ref<string>();

const lobbyErrors = ref<string[]>([]);

const errorLib = {
  empty: "Please fill out all inputs before joining a room",
};

const handleLobbySubmission = (e: SubmitEvent) => {
  lobbyErrors.value = [];
  const body = {
    roomCode: roomCode.value,
    name: name.value,
    selectedAvatar: selectedAvatar.value,
  };

  if (Object.entries(body).filter((o) => o == undefined || o == "").length) {
    lobbyErrors.value.push(errorLib.empty);
    return;
  }

  roomStore.joinRoom(body);
};
</script>
