import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { UserPlus, User, Lock, Eye, EyeOff, ArrowLeft, Building2, GraduationCap, Users, Shield } from 'lucide-react'

export default function Register() {
  const { register } = useContext(AuthContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(username, password, role)
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { 
      value: 'student', 
      label: 'Estudiante', 
      icon: GraduationCap, 
      color: 'blue' 
    },
    { 
      value: 'teacher', 
      label: 'Docente', 
      icon: Users, 
      color: 'blue' 
    },
    { 
      value: 'admin', 
      label: 'Administrador', 
      icon: Shield, 
      color: 'blue' 
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section - HORIZONTAL CON ICONO */}
        <div className="flex items-center gap-4 mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="text-white" size={26} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-left">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg leading-tight">Sistema de Planificación</h1>
            <p className="text-blue-100 text-xs font-medium mt-0.5">YAVIRAC - Gestión Académica</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Back Button */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Volver al login</span>
          </Link>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Crear Cuenta</h2>
            <p className="text-slate-600 text-sm">Completa el formulario para registrarte</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Elige tu nombre de usuario"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Usuario
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        ${role === option.value 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            role === option.value 
                              ? 'bg-blue-500' 
                              : 'bg-slate-200'
                          }`}>
                            <IconComponent 
                              className={role === option.value ? 'text-white' : 'text-slate-600'} 
                              size={20} 
                            />
                          </div>
                        </div>
                        <div className="text-xs font-medium text-slate-700">{option.label}</div>
                      </div>
                      {role === option.value && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hidden select for form submission */}
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="hidden"
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Docente</option>
              <option value="admin">Admin</option>
            </select>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" required className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />
              <label className="text-slate-600">
                Acepto los{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  términos y condiciones
                </a>{' '}
                de uso
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-6">
          © 2025 YAVIRAC. Todos los derechos reservados.
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}