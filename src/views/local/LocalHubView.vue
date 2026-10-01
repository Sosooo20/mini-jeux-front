<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import PlayersSetup from '@/components/PlayersSetup.vue'
import GameCard from '@/components/GameCard.vue'
import { LOCAL_GAMES } from '@/lib/games'
import { usePlayersStore } from '@/stores/players'

const players = usePlayersStore()
</script>

<template>
  <PageHeader title="Jeux en local" back />
  <PlayersSetup />
  <GameCard
    v-for="game in LOCAL_GAMES"
    :key="game.id"
    :game="game"
    :disabled="players.count < game.minPlayers"
  />
</template>
