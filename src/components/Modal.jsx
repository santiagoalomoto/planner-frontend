import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}) {
  const modalRef = useRef(null)

  // 🔹 Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // 🔹 Enfocar modal al abrir
  useEffect(() => {
    if (open && modalRef.current) modalRef.current.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${width} mx-4 p-6 relative border border-gray-100`}
          >
            {/* 🔹 Encabezado */}
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-500 hover:bg-gray-100 p-2 rounded-full transition"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* 🔹 Contenido */}
            <div className="max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
