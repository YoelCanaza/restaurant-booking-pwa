import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))

    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
