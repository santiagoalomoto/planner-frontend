import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Button";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(username, password);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Bienvenido👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Ingresa tus credenciales para continuar
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-3 py-2 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
              autoComplete="username"
            />
          </div>

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
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "Cargando..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Crear una cuenta
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
