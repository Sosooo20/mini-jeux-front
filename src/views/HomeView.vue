<template>
  <main class="home">
    <h1>🍻 Mini-jeux entre amis</h1>
    <RouterLink :to="{ name: 'local' }" class="btn">📱 Un seul téléphone</RouterLink>
    <RouterLink :to="{ name: 'online' }" class="btn btn--ghost"
      >🌐 En ligne (chacun son tél)</RouterLink
    >
  </main>
</template>

<style scoped>
.home {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}
h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 24px;
}
</style>
