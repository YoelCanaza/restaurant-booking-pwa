/**
 * PlaceholderPage — componente interno reutilizable
 * Muestra el nombre de la página y el rol activo.
 * Se reemplazará con la implementación real en cada Fase.
 */
import { motion } from 'framer-motion'
import { useCurrentUser } from '../hooks'

interface PlaceholderPageProps {
  title: string
  emoji: string
  phase: string
}

export default function PlaceholderPage({ title, emoji, phase }: PlaceholderPageProps) {
  const user = useCurrentUser()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100dvh - 56px)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{emoji}</div>

      <h1
        style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--color-carbon)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>

      {user && (
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--color-carbon)', opacity: 0.5 }}>
          Rol activo:{' '}
          <strong style={{ color: 'var(--color-terracotta)' }}>
            {user.name} ({user.role})
          </strong>
        </p>
      )}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px dashed var(--color-border)',
          borderRadius: 12,
          padding: '0.6rem 1rem',
          fontSize: '0.8rem',
          color: 'var(--color-carbon)',
          opacity: 0.6,
        }}
      >
        🚧 Se implementa en <strong>{phase}</strong>
      </div>
    </motion.div>
  )
}
