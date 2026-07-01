import { defineStore } from 'pinia'
import api from '../services/api'

export interface AuthUser {
  _id: string
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
    async login(email: string, password: string) {
      const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
        email,
        password,
      })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('crunchymark_token', data.token)
      localStorage.setItem('crunchymark_user', JSON.stringify(data.user))
    },
    async registro(nombre: string, email: string, password: string) {
      const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/registro', {
        nombre,
        email,
        password,
      })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('crunchymark_token', data.token)
      localStorage.setItem('crunchymark_user', JSON.stringify(data.user))
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('crunchymark_token')
      localStorage.removeItem('crunchymark_user')
    },
  },
})
