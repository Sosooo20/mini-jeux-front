import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

export default router
