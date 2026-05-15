import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../types'

// ─── USUARIOS MOCK (un usuario por rol) ──────────────────────
const MOCK_USERS: Record<UserRole, User> = {
  cliente: {
    id: 'usr_cliente_01',
    name: 'María Quispe',
    role: 'cliente',
    phone: '951234567',
    avatarInitials: 'MQ',
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Carlos Mamani',
    role: 'admin',
    phone: '952345678',
    avatarInitials: 'CM',
  },
  delivery: {
    id: 'usr_delivery_01',
    name: 'Juan Apaza',
    role: 'delivery',
    phone: '953456789',
    avatarInitials: 'JA',
  },
}

// ─── TIPOS DEL STORE ─────────────────────────────────────────
interface AuthState {
  user: User | null
  login: (user: User) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

// ─── STORE ───────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: (user) => set({ user }),

      logout: () => set({ user: null }),

      // switchRole: carga el usuario mock del rol dado.
      // Útil durante el desarrollo para probar los 3 flujos.
      switchRole: (role) => set({ user: MOCK_USERS[role] }),
    }),
    {
      name: 'rincon-andino-auth', // clave en localStorage
    }
  )
)

// ─── MOCK USERS exportado para tests y dev tools ─────────────
export { MOCK_USERS }
