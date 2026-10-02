import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import { useUserStore } from '@/stores/user'
import { useNavigationStore } from '@/stores/navigation'

declare module 'vue-router' {
  interface RouteMeta {
    /** Masque la barre de navigation du bas */
    hideNav?: boolean
    /** Nom du composant du jeu : sa partie est conservée pendant un passage par l'appareil photo */
    game?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/bienvenue', name: 'welcome', component: WelcomeView, meta: { hideNav: true } },
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/photo',
      name: 'camera',
      component: () => import('../views/CameraView.vue'),
    },
    {
      path: '/local',
      children: [
        {
          path: 'bombe',
          name: 'bombe',
          component: () => import('../views/local/BombeView.vue'),
          meta: { game: 'BombeView' },
        },
        {
          path: 'roulette',
          name: 'roulette',
          component: () => import('../views/local/RouletteView.vue'),
          meta: { game: 'RouletteView' },
        },
        {
          path: 'palmier',
          name: 'palmier',
          component: () => import('../views/local/PalmierView.vue'),
          meta: { game: 'PalmierView' },
        },
        {
          path: 'chrono',
          name: 'chrono',
          component: () => import('../views/local/ChronoView.vue'),
          meta: { game: 'ChronoView' },
        },
        {
          path: 'confessions',
          name: 'confessions',
          component: () => import('../views/local/ConfessionsView.vue'),
          meta: { game: 'ConfessionsView' },
        },
        {
          path: 'jamais',
          name: 'jamais',
          component: () => import('../views/local/JamaisView.vue'),
          meta: { game: 'JamaisView' },
        },
        {
          path: 'preferes',
          name: 'preferes',
          component: () => import('../views/local/PreferesView.vue'),
          meta: { game: 'PreferesView' },
        },
        {
          path: 'pourrait',
          name: 'pourrait',
          component: () => import('../views/local/PourraitView.vue'),
          meta: { game: 'PourraitView' },
        },
      ],
    },
    {
      path: '/salon',
      children: [
        { path: '', name: 'online', component: () => import('../views/online/OnlineView.vue') },
        {
          path: 'profil',
          name: 'room-profile',
          component: () => import('../views/online/ProfileView.vue'),
        },
        {
          // Lien d'invitation : …/salon/KBZT
          path: ':code([A-Za-z]{4})',
          name: 'room',
          component: () => import('../views/online/RoomView.vue'),
          props: true,
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Sans pseudo, toute l'appli renvoie vers la page de saisie du pseudo
router.beforeEach((to) => {
  if (to.name !== 'welcome' && !useUserStore().hasPseudo) {
    return { name: 'welcome' }
  }
})

// Suit la partie en cours : conservée pendant un détour par l'appareil photo,
// abandonnée dès qu'on va ailleurs
router.afterEach((to) => {
  const navigation = useNavigationStore()
  if (to.meta.game) {
    navigation.activeGame = { path: to.fullPath, component: to.meta.game }
  } else if (to.name !== 'camera') {
    navigation.activeGame = null
  }
})

export default router
