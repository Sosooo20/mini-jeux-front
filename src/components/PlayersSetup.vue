<script setup lang="ts">
import { ref } from 'vue'
import { usePlayersStore } from '@/stores/players'

const players = usePlayersStore()
const newName = ref('')

function submit() {
  players.add(newName.value)
  newName.value = ''
}
</script>

<template>
  <section class="card players">
    <h2>Joueurs ({{ players.count }})</h2>
    <form class="add" @submit.prevent="submit">
      <input v-model="newName" placeholder="Prénom" maxlength="20" enterkeyhint="done" />
      <button class="btn" type="submit" :disabled="!newName.trim()">+</button>
    </form>
    <ul>
      <li v-for="name in players.names" :key="name">
        <span>{{ name }}</span>
        <button :aria-label="`Retirer ${name}`" @click="players.remove(name)">✕</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.players {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
h2 {
  font-size: 1.1rem;
}
.add {
  display: flex;
  gap: 8px;
}
.add .btn {
  width: var(--tap);
  flex-shrink: 0;
}
ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
li {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 14px;
  border-radius: 999px;
  background: var(--bg);
}
li button {
  width: 44px;
  height: 44px;
  border: none;
  background: none;
  color: var(--muted);
  font-size: 1rem;
}
</style>
