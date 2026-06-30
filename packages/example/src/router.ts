import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    { path: '/', redirect: '/ui' },
    { path: '/ui', name: 'ui-showcase', component: () => import('./Index.vue') },
    { path: '/ui/:component', name: 'ui-showcase-component', component: () => import('./Index.vue') },
    { path: '/:pathMatch(.*)', redirect: '/ui' }
  ]
})
