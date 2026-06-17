import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = type === 'success'
    ? 'bg-success/20 border-success/40 text-success'
    : 'bg-danger/20 border-danger/40 text-danger'

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        max-w-[90vw] w-full max-w-sm
        px-4 py-3 rounded-2xl border
        flex items-center gap-3
        transition-all duration-300
        ${colors}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <span className="text-lg">{type === 'success' ? '✓' : '✗'}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
