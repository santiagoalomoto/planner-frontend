import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await register(username, password, role);
      setMessage("✅ Cuenta creada con éxito. Ahora puedes iniciar sesión.");
      setUsername("");
      setPassword("");
      setRole("student");
    } catch (err) {
      setError(err?.response?.data?.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Crear cuenta ✨
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Regístrate para acceder al sistema académico
        </p>

        {/* Mensajes de éxito o error */}
        {message && (
          <div className="bg-green-100 text-green-700 border border-green-300 px-3 py-2 rounded-md mb-4 text-sm text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-3 py-2 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={submit} className="space-y-4">
          {/* Campo Usuario */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa un nombre de usuario"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
              autoComplete="username"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
              autoComplete="new-password"
            />
          </div>

          {/* Campo Rol */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition bg-white"
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>
        </form>

        {/* Link hacia login */}
        <div className="text-center mt-6 text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Iniciar sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
