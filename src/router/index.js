import { createRouter, createWebHistory } from 'vue-router'
import { initializeAuth, useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/confirm',
    name: 'auth-confirm',
    component: () => import('@/views/AuthConfirmView.vue'),
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'consultation', component: () => import('@/views/ConsultationView.vue') },
      {
        path: 'admin/users', name: 'admin-users',
        component: () => import('@/views/admin/UsersView.vue'), meta: { requiresAdmin: true },
      },
      {
        path: 'admin/institutions', name: 'admin-institutions',
        component: () => import('@/views/admin/InstitutionsView.vue'), meta: { requiresAdmin: true },
      },
      {
        path: 'admin/journals', name: 'admin-journals',
        component: () => import('@/views/admin/JournalsView.vue'), meta: { requiresAdmin: true },
      },
      {
        path: 'admin/indexers', name: 'admin-indexers',
        component: () => import('@/views/admin/IndexersView.vue'), meta: { requiresAdmin: true },
      },
      {
        path: 'admin/edicts', name: 'admin-edicts',
        component: () => import('@/views/admin/EdictsView.vue'), meta: { requiresAdmin: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  await initializeAuth()
  const auth = useAuth()

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin.value) {
    return { name: 'consultation', query: { access: 'denied' } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated.value) return { name: 'consultation' }
  return true
})

router.afterEach((to) => {
  const titles = {
    login: 'Entrar',
    'auth-confirm': 'Ativar conta',
    consultation: 'Consulta',
    'admin-users': 'Usuários',
    'admin-institutions': 'Instituições',
    'admin-journals': 'Revistas',
    'admin-indexers': 'Indexadores',
    'admin-edicts': 'Editais',
  }
  document.title = `${titles[to.name] ?? 'Aplicação'} · Banco de Editais`
})

export default router
