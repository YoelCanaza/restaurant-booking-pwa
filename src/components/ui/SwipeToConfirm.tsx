import { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { Check } from 'lucide-react'

interface SwipeToConfirmProps {
  onConfirm: () => void
  label?: string
}

export default function SwipeToConfirm({ onConfirm, label = 'Desliza para confirmar →' }: SwipeToConfirmProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = containerWidth * 0.6 // 60% is usually enough for UX
    if (info.offset.x > threshold) {
      // Completed swipe
      controls.start({ x: containerWidth - 48, opacity: 0 }).then(() => {
        onConfirm()
        // Reset after a short delay
        setTimeout(() => {
          controls.set({ x: 0, opacity: 1 })
        }, 500)
      })
    } else {
      // Reset position
      controls.start({ x: 0 })
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-12 bg-terracotta/10 rounded-xl overflow-hidden flex items-center"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: containerWidth - 48 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="absolute left-0 h-full w-12 bg-emerald-500 flex items-center justify-center text-white rounded-xl shadow-lg z-10 cursor-grab active:cursor-grabbing"
      >
        <Check size={20} />
      </motion.div>
      <span className="mx-auto text-sm font-medium text-carbon/70 pointer-events-none">
        {label}
      </span>
    </div>
  )
}
