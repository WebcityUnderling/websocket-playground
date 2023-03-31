<template>
  <main>
    <!-- Room -->
    <div v-if="connected" class="room">
      <div id="#stage" class="stage">
        
        <!-- it's you! -->
        <User :name="name" :avatar="avatar" :position="position"/>

        <!-- it's everyone else! -->
        <User v-for="friend in friends" :name="friend.name" :avatar="friend.avatar" :position="friend.position"/>

      </div>
      <button @click="requestClose()">Leave</button>
    </div>

    <!-- Landing -->
    <div v-else class="landing">
      <form @submit.prevent="requestJoin()">
        <div>
          <label for="name">Enter you name</label>
          <input v-model="name" id="name" type="text" required>
        </div>
        <div>
          <h2>
            Choose Avatar:
          </h2>
          <div class="buttons">
            <button v-for="button in avatarOptions" @click="avatar = button.alias" type="button" :disabled="button.alias == avatar ? true: false">{{ button.icon }}</button>
          </div>
        </div>

        <button type="submit" :disabled="(!name || !avatar) ? true : false">Join</button>
      </form>

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import User from './components/User.vue';
import { usableAvatars } from './utils';
import { _ } from 'lodash'

    //connection
    let ws = null; 
    let connected = ref(false);

    //client info
    let clientID = ref(null);  
    let name = '';
    let avatar = ref(null);
    let position = ref({
      x: 300,
      y: 300,
    });

    //template bits
    let stage = null;
    let friends = ref([]);
    const avatarOptions = usableAvatars

    //handle connection requests
    function requestJoin() {
      const requestParams = new URLSearchParams({ name: name, avatar: avatar.value});
        ws = new WebSocket(`ws://localhost:8080/?${requestParams.toString()}`);
        ws.onopen = handleOnOpen;
        ws.onmessage = handleOnMessage;
    }

    function requestClose() {
      if (ws) {
        ws.close();
        connected.value = false;
        ws = null;
      }
    }

    // websocket event handlers
    function handleOnOpen() {
      if (ws) {
        connected.value = true;
        setTimeout(() => {
          stage = document.querySelector('.stage');
          stage.addEventListener('mousemove', handleOnMove)
        }, 0)
      }
    }

    function handleOnMessage(event) {
      if (ws) {
        const payload = JSON.parse(event.data);
        
        if (payload.action === 'join') handleActionJoin(payload);
        if (payload.action === 'user_add') handleActionUserAdd(payload);
        if (payload.action === 'user_remove') handleActionUserRemove(payload);
        if (payload.action === 'user_update') handleActionUserMove(payload);
      }
    }

    //Setup Your movement handlers
    function handleOnMove(event) {
      position.value = { x: event.clientX, y: event.clientY }
      moveEvent();
    }

    const moveEvent = _.throttle(function() {
          ws.send(JSON.stringify({
            action: 'user_update',
            from: clientID.value,
            content: {
              position: {
                x: position.value.x,
                y: position.value.y,
              }
            }
        }))
      }, 25)

    // Mesage action handlers
    function handleActionJoin(event) {
      clientID.value = event.content.id;
      friends.value = event.content.clients
    } //when you join the server

    function handleActionUserAdd(event) {
      if (event.from != clientID.value) {
        friends.value[event.content.id] = event.content;
      }
    } //when someone else joins the server

    function handleActionUserRemove(event) {
      if (event.from != clientID.value) {
        delete friends.value[event.content]
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

<style>
.stage {
  width: 600px;
  height: 600px;
  background: #525252;
  border: 1px solid #999;
  cursor: none;
  overflow: hidden;
}
</style>
