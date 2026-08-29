import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from './components/AppShell.vue'
import LoginView from './views/LoginView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: LoginView, meta: { public: true, title: '登入' } },
    { path: '/', component: AppShell, redirect: '/dashboard', children: [
      { path: 'dashboard', component: () => import('./views/DashboardView.vue'), meta: { title: '營運總覽' } },
      { path: 'products', component: () => import('./views/ProductsView.vue'), meta: { title: '商品管理' } },
      { path: 'products/new', component: () => import('./views/ProductFormView.vue'), meta: { title: '新增商品' } },
      { path: 'products/:id/edit', component: () => import('./views/ProductFormView.vue'), meta: { title: '編輯商品' } },
      { path: 'orders', component: () => import('./views/OrdersView.vue'), meta: { title: '訂單管理' } },
      { path: 'orders/:id', component: () => import('./views/OrderDetailView.vue'), meta: { title: '訂單詳細' } },
      { path: 'customers', component: () => import('./views/CustomersView.vue'), meta: { title: '會員管理' } },
      { path: 'promotions', component: () => import('./views/PromotionsView.vue'), meta: { title: '促銷管理' } },
    ]},
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})
router.beforeEach(to => {
  const authenticated = localStorage.getItem('commerce-os-auth') === 'true'
  if (!to.meta.public && !authenticated) return '/login'
  if (to.path === '/login' && authenticated) return '/dashboard'
})
