import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/Button'


export default function Login(){
const { login } = useContext(AuthContext)
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)


const submit = async (e) => {
e.preventDefault()
try {
setLoading(true)
await login(username, password)
} catch (err) {
setError(err?.response?.data?.message || 'Login failed')
} finally { setLoading(false) }
}


return (
<div className="min-h-screen flex items-center justify-center">
<div className="w-full max-w-md bg-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
{error && <div className="text-red-600 mb-2">{error}</div>}
<form onSubmit={submit} className="space-y-3">
<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Usuario" className="w-full p-2 border rounded" />
<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-2 border rounded" />
<div className="flex justify-between items-center">
<Button type="submit">{loading ? 'Cargando...' : 'Entrar'}</Button>
<Link to="/register" className="text-sm underline">Crear cuenta</Link>
</div>
</form>
</div>
</div>
)
}