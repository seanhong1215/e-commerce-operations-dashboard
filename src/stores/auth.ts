import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const KEY = 'commerce-os-auth'
export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(localStorage.getItem(KEY) === 'true')
  const user = ref({ name: 'Sean Chen', role: '營運管理員' })
  const isAuthenticated = computed(() => authenticated.value)
  async function login(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 450))
    if (!email || !password) throw new Error('請輸入帳號與密碼')
    authenticated.value = true
    localStorage.setItem(KEY, 'true')
  }
  function logout() { authenticated.value = false; localStorage.removeItem(KEY) }
  return { authenticated, isAuthenticated, user, login, logout }
})
