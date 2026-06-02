import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, UserRole } from '../types'

// ─── USUARIOS MOCK ────────────────────────────────────────────
const now = new Date().toISOString()

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Carlos Mamani',
    role: 'admin',
    phone: '952345678',
    avatarInitials: 'CM',
    activo: true,
    createdAt: now,
  },
  {
    id: 'usr_cliente_01',
    name: 'María Quispe',
    role: 'cliente',
    phone: '951234567',
    avatarInitials: 'MQ',
    activo: true,
    createdAt: now,
    // creadoPorAdminId: undefined → cliente auto-registrado
  },
  {
    id: 'usr_delivery_01',
    name: 'Juan Apaza',
    role: 'delivery',
    phone: '953456789',
    avatarInitials: 'JA',
    activo: true,
    createdAt: now,
    creadoPorAdminId: 'usr_admin_01',
  },
  {
    id: 'usr_mesero_01',
    name: 'Pedro Flores',
    role: 'mesero',
    phone: '954567890',
    avatarInitials: 'PF',
    activo: true,
    createdAt: now,
    creadoPorAdminId: 'usr_admin_01',
  },
  {
    id: 'usr_cocina_01',
    name: 'Chef Gastón',
    role: 'cocina',
    phone: '955678901',
    avatarInitials: 'CG',
    activo: true,
    createdAt: now,
    creadoPorAdminId: 'usr_admin_01',
  },
  {
    id: 'usr_caja_01',
    name: 'Lucía Condori',
    role: 'caja',
    phone: '956789012',
    avatarInitials: 'LC',
    activo: true,
    createdAt: now,
    creadoPorAdminId: 'usr_admin_01',
  },
]

/** Mapa rápido id → User. Útil para el RoleSelector de desarrollo. */
export const MOCK_USERS: Record<UserRole, User> = {
  cliente: INITIAL_USERS.find((u) => u.role === 'cliente')!,
  admin: INITIAL_USERS.find((u) => u.role === 'admin')!,
  delivery: INITIAL_USERS.find((u) => u.role === 'delivery')!,
  mesero: INITIAL_USERS.find((u) => u.role === 'mesero')!,
  cocina: INITIAL_USERS.find((u) => u.role === 'cocina')!,
  caja: INITIAL_USERS.find((u) => u.role === 'caja')!,
}

// ─── TIPOS DEL STORE ─────────────────────────────────────────
export interface OperationResult {
  ok: boolean
  error?: string
}

interface AuthState {
  /** Usuario actualmente logueado */
  user: User | null

  /** Lista completa de usuarios del sistema */
  users: User[]

  // ── Sesión ────────────────────────────────────────────────
  login: (user: User) => void
  logout: () => void

  /**
   * Login por teléfono (identificador principal, §3.1). Mock: valida que la
   * cuenta exista y esté activa. La autenticación segura (contraseña/OTP)
   * llegará con el backend (Supabase Auth).
   */
  loginPorTelefono: (phone: string) => OperationResult

  /**
   * Utility de desarrollo: carga el usuario mock del rol dado.
   * Simula el login sin contraseña — NO usar en producción.
   */
  switchRole: (role: UserRole) => void

  // ── Gestión de empleados (solo Admin) ─────────────────────

  /**
   * Crea una cuenta de empleado (mesero, cocina, delivery, caja).
   * Solo el admin puede invocar esto. Los clientes se auto-registran.
   */
  addEmpleado: (
    datos: { name: string; phone: string; role: UserRole; avatarInitials?: string },
    adminId: string
  ) => OperationResult

  /**
   * Activa o desactiva la cuenta de un empleado.
   * Un empleado desactivado no puede iniciar sesión.
   */
  toggleEmpleadoActivo: (userId: string, adminId: string) => OperationResult

  /** Cambia el rol de un empleado */
  cambiarRolEmpleado: (userId: string, nuevoRol: UserRole, adminId: string) => OperationResult

  // ── Auto-registro de clientes ─────────────────────────────

  /**
   * Registra una cuenta de cliente.
   * Valida que el teléfono no esté ya en uso.
   */
  registrarCliente: (datos: {
    name: string
    phone: string
    email?: string
  }) => OperationResult & { userId?: string }

  /**
   * Checkout de invitado (registro invisible): si el teléfono ya tiene cuenta
   * de cliente, inicia sesión con ella; si no, crea la cuenta y la inicia.
   * Base del modelo "invitado primero, cuenta opcional" (BUSINESS_LOGIC §3.4).
   */
  asegurarSesionCliente: (datos: { name: string; phone: string }) => OperationResult & { userId?: string }

  // ── Selectores ────────────────────────────────────────────
  getEmpleados: () => User[]
  getClientes: () => User[]
  getUserById: (id: string) => User | undefined
}

// ─── STORE ───────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      users: INITIAL_USERS,

      // ── Sesión ──────────────────────────────────────────────
      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      loginPorTelefono: (phone) => {
        const u = get().users.find((x) => x.phone === phone.trim())
        if (!u) return { ok: false, error: 'No encontramos una cuenta con ese teléfono.' }
        if (!u.activo) return { ok: false, error: 'Tu cuenta está desactivada. Contacta al restaurante.' }
        set({ user: u })
        return { ok: true }
      },

      switchRole: (role) => {
        const mockUser = MOCK_USERS[role]
        set({ user: mockUser })
      },

      // ── Gestión de Empleados ────────────────────────────────
      addEmpleado: (datos, adminId) => {
        const state = get()

        // Validar que el admin existe
        const admin = state.users.find((u) => u.id === adminId && u.role === 'admin' && u.activo)
        if (!admin) return { ok: false, error: 'Solo el administrador puede crear empleados.' }

        // Validar unicidad del teléfono
        const yaExiste = state.users.some((u) => u.phone === datos.phone)
        if (yaExiste) return { ok: false, error: `El teléfono ${datos.phone} ya está registrado en el sistema.` }

        // Validar que no se cree otro admin por esta vía
        if (datos.role === 'admin') {
          return { ok: false, error: 'No se puede crear otro administrador desde este panel.' }
        }

        const nuevoEmpleado: User = {
          id: `usr_${datos.role}_${Date.now()}`,
          name: datos.name,
          phone: datos.phone,
          role: datos.role,
          avatarInitials:
            datos.avatarInitials ||
            datos.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          activo: true,
          createdAt: new Date().toISOString(),
          creadoPorAdminId: adminId,
        }

        set((s) => { s.users.push(nuevoEmpleado) })
        return { ok: true }
      },

      toggleEmpleadoActivo: (userId, adminId) => {
        const state = get()
        const admin = state.users.find((u) => u.id === adminId && u.role === 'admin')
        if (!admin) return { ok: false, error: 'No tienes permisos.' }

        const empleado = state.users.find((u) => u.id === userId)
        if (!empleado) return { ok: false, error: 'Usuario no encontrado.' }

        // El admin no puede desactivarse a sí mismo
        if (userId === adminId) return { ok: false, error: 'No puedes desactivar tu propia cuenta.' }

        // No se puede desactivar a clientes desde esta acción (usan otra vía)
        if (empleado.role === 'cliente') {
          return { ok: false, error: 'Para gestionar clientes usa el panel de clientes.' }
        }

        set((s) => {
          const u = s.users.find((u) => u.id === userId)
          if (u) u.activo = !u.activo
        })

        return { ok: true }
      },

      cambiarRolEmpleado: (userId, nuevoRol, adminId) => {
        const state = get()
        const admin = state.users.find((u) => u.id === adminId && u.role === 'admin')
        if (!admin) return { ok: false, error: 'No tienes permisos.' }

        const empleado = state.users.find((u) => u.id === userId)
        if (!empleado) return { ok: false, error: 'Usuario no encontrado.' }

        if (userId === adminId) return { ok: false, error: 'No puedes cambiar tu propio rol.' }
        if (nuevoRol === 'admin') return { ok: false, error: 'No se puede asignar el rol de administrador.' }
        if (empleado.role === 'cliente') {
          return { ok: false, error: 'No se puede cambiar el rol de un cliente.' }
        }

        set((s) => {
          const u = s.users.find((u) => u.id === userId)
          if (u) u.role = nuevoRol
        })

        return { ok: true }
      },

      registrarCliente: (datos) => {
        const state = get()

        // Validar teléfono único
        const yaExiste = state.users.some((u) => u.phone === datos.phone)
        if (yaExiste) {
          return {
            ok: false,
            error: 'Este número de teléfono ya tiene una cuenta. Por favor inicia sesión.',
          }
        }

        // Validar formato de teléfono (9 dígitos, Perú)
        if (!/^\d{9}$/.test(datos.phone)) {
          return { ok: false, error: 'El número de teléfono debe tener 9 dígitos.' }
        }

        const nuevoCliente: User = {
          id: `usr_cliente_${Date.now()}`,
          name: datos.name,
          phone: datos.phone,
          email: datos.email,
          role: 'cliente',
          avatarInitials: datos.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          activo: true,
          createdAt: new Date().toISOString(),
          // creadoPorAdminId: undefined → auto-registrado
        }

        set((s) => { s.users.push(nuevoCliente) })

        // Auto-login después del registro
        set({ user: nuevoCliente })

        return { ok: true, userId: nuevoCliente.id }
      },

      asegurarSesionCliente: (datos) => {
        const phone = datos.phone.trim()
        const name = datos.name.trim()
        if (!name) return { ok: false, error: 'Ingresa tu nombre.' }
        if (!/^\d{9}$/.test(phone)) return { ok: false, error: 'El teléfono debe tener 9 dígitos.' }

        const existente = get().users.find((u) => u.phone === phone)
        if (existente) {
          if (existente.role !== 'cliente') return { ok: false, error: 'Ese teléfono pertenece a una cuenta del personal.' }
          if (!existente.activo) return { ok: false, error: 'La cuenta está desactivada. Contacta al restaurante.' }
          set({ user: existente })
          return { ok: true, userId: existente.id }
        }

        const nuevoCliente: User = {
          id: `usr_cliente_${Date.now()}`,
          name,
          phone,
          role: 'cliente',
          avatarInitials: name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
          activo: true,
          createdAt: new Date().toISOString(),
        }
        set((s) => { s.users.push(nuevoCliente) })
        set({ user: nuevoCliente })
        return { ok: true, userId: nuevoCliente.id }
      },

      // ── Selectores ──────────────────────────────────────────
      getEmpleados: () =>
        get().users.filter((u) => u.role !== 'cliente'),

      getClientes: () =>
        get().users.filter((u) => u.role === 'cliente'),

      getUserById: (id) =>
        get().users.find((u) => u.id === id),
    })),
    {
      name: 'rincon-andino-auth',
    }
  )
)
