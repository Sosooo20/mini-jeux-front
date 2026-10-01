import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/bienvenue', name: 'welcome', component: WelcomeView },
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/local',
      children: [
        { path: '', name: 'local', component: () => import('../views/local/LocalHubView.vue') },
        { path: 'bombe', name: 'bombe', component: () => import('../views/local/BombeView.vue') },
        {
          path: 'roulette',
          name: 'roulette',
          component: () => import('../views/local/RouletteView.vue'),
        },
        {
          path: 'palmier',
          name: 'palmier',
          component: () => import('../views/local/PalmierView.vue'),
        },
        {
          path: 'chrono',
          name: 'chrono',
          component: () => import('../views/local/ChronoView.vue'),
        },
        {
          path: 'confessions',
          name: 'confessions',
          component: () => import('../views/local/ConfessionsView.vue'),
        },
      ],
    },
    { path: '/online', name: 'online', component: () => import('../views/online/OnlineView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Sans pseudo, toute l'appli renvoie vers la page de saisie du pseudo
router.beforeEach((to) => {
  if (to.name !== 'welcome' && !useUserStore().hasPseudo) {
    return { name: 'welcome' }
  }
})

export default router
