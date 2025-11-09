import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/Button'


export default function Register(){
const { register } = useContext(AuthContext)
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const [role, setRole] = useState('student')


const submit = async (e) => {
e.preventDefault()
await register(username, password, role)
}


return (
<div className="min-h-screen flex items-center justify-center">
<div className="w-full max-w-md bg-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Registro</h2>
<form onSubmit={submit} className="space-y-3">
<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Usuario" className="w-full p-2 border rounded" />
<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-2 border rounded" />


<select value={role} onChange={e=>setRole(e.target.value)} className="w-full p-2 border rounded">
<option value="student">Estudiante</option>
<option value="teacher">Docente</option>
<option value="admin">Admin</option>
</select>


<div className="flex justify-end">
<Button>Crear cuenta</Button>
</div>
</form>
</div>
</div>
)
}