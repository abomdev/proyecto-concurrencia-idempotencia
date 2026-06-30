import { defineStore } from 'pinia'

export interface AuthUser {
  nombre: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('crunchymark_token')
    const userRaw = localStorage.getItem('crunchymark_user')
    return {
      token,
      user: userRaw ? (JSON.parse(userRaw) as AuthUser) : null,
    }
  },
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(email: string, _password: string) {
      await new Promise((r) => setTimeout(r, 1000))
      const nombre = email.split('@')[0]
      const token = `mock.jwt.${btoa(email)}.${Date.now()}`
      this.token = token
      this.user = { nombre, email }
      localStorage.setItem('crunchymark_token', token)
      localStorage.setItem('crunchymark_user', JSON.stringify(this.user))
    },
    async registro(nombre: string, email: string, _password: string) {
      await new Promise((r) => setTimeout(r, 1000))
      const token = `mock.jwt.${btoa(email)}.${Date.now()}`
      this.token = token
      this.user = { nombre, email }
      localStorage.setItem('crunchymark_token', token)
      localStorage.setItem('crunchymark_user', JSON.stringify(this.user))
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('crunchymark_token')
      localStorage.removeItem('crunchymark_user')
    },
  },
})
