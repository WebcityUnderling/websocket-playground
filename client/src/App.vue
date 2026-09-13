<template>
  <main class="min-h-dvh h-dvh">
    <KeepAlive>
      <Lobby
        v-if="roomStore.status != 'joined'"
        :selectable-avatars="usableAvatars"
      />
    </KeepAlive>
    <Room v-if="roomStore.status == 'joined'">You got in!</Room>
    <!-- Room -->
    <!-- <div v-if="connected" class="room">
      <div id="#stage" class="stage">
        <User :name="name" :avatar="avatar" :position="position" />

        <User
          v-for="friend in friends"
          :name="friend.name"
          :avatar="friend.avatar"
          :position="friend.position"
        />
      </div>
      <button @click="requestClose()">Leave</button>
    </div> -->
  </main>
</template>

<script setup>
import { ref } from "vue";
import Lobby from "./components/Lobby.vue";
import Room from "./components/Room.vue";
import { usableAvatars } from "./data/avatars.ts";
import { useRoomStore } from "./store/roomStore.ts";

import { _ } from "lodash";

const roomStore = useRoomStore();

//client info
let clientID = ref(null);
let name = "";
let avatar = ref(null);
let position = ref({
  x: 300,
  y: 300,
});

//template bits
let stage = null;
let friends = ref([]);
const avatarOptions = usableAvatars;

function requestClose() {
  if (socket) {
    socket.close();
    connected.value = false;
    socket = null;
  }
}

function handleOnMessage(event) {
  if (socket) {
    const payload = JSON.parse(event.data);

    if (payload.action === "join") handleActionJoin(payload);
    if (payload.action === "user_add") handleActionUserAdd(payload);
    if (payload.action === "user_remove") handleActionUserRemove(payload);
    if (payload.action === "user_update") handleActionUserMove(payload);
  }
}

//Setup Your movement handlers
function handleOnMove(event) {
  const xPosition = event.clientX - stage.getBoundingClientRect().x;
  const yPosition = event.clientY - stage.getBoundingClientRect().y;
  position.value = { x: xPosition, y: yPosition };
  moveEvent();
}

const moveEvent = _.throttle(function () {
  socket.send(
    JSON.stringify({
      action: "user_update",
      from: clientID.value,
      content: {
        position: {
          x: position.value.x,
          y: position.value.y,
        },
      },
    }),
  );
}, 25);

// Mesage action handlers
function handleActionJoin(event) {
  clientID.value = event.content.id;
  friends.value = event.content.clients;
} //when you join the server

function handleActionUserAdd(event) {
  if (event.from != clientID.value) {
    friends.value[event.content.id] = event.content;
  }
} //when someone else joins the server

function handleActionUserRemove(event) {
  if (event.from != clientID.value) {
    delete friends.value[event.content];
  }
} //when a user leaves the server

function handleActionUserMove(event) {
  if (event.from != clientID.value) {
    let newData = event.content;
    delete newData[clientID.value];
    //this is inefficient, but it works so Idk for now.
    friends.value = newData;
  }
} //when someone's position changed on the server
</script>
