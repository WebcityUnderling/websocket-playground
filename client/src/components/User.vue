<template>
    <div class="user" :style="{left: `${position.x}px`, top: `${position.y}px`}">
        <span class="icon">{{ icon }}</span>
        <span class="name">{{ name }}</span>
    </div>
</template>
<script setup>
 import { defineProps, computed } from 'vue';
 import { usableAvatars } from '../utils';

 const props = defineProps({
    name: String,
    avatar: String,
    position: Object
 })

const avatarOptions = usableAvatars;

const icon = computed(() => {
    return avatarOptions.find(avatar => avatar.alias === props.avatar).icon;
})
</script>

<style>
.user {
    position: absolute;
    text-align: center;
    width: 32px;
    transform: translate(-16px, -16px)
}

.user .icon {
    display: block;
    font-size: 2rem;
    line-height: 1;

}

.user .name {
    white-space: none;
    display: block;
    position: absolute;
    top: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    background: #444; 
    font-size: 0.6rem;
    color: white;
    padding: 2px 4px;
    line-height: 1;
    border: 1px solid #666;
}
</style>