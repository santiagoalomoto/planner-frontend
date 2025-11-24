import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🧩 Páginas principales
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

// 🛡️ Protección de rutas
import ProtectedRoute from './ProtectedRoute';

// 📘 Nuevas vistas
import Semesters from '../pages/Semesters';
import Courses from '../pages/Courses';
import Teachers from '../pages/Teachers';
import Students from '../pages/Students';
import Schedules from '../pages/Schedules';
import Reports from '../pages/Reports';
import Rooms from '../pages/Rooms';
import Sections from '../pages/Sections';
import StudentSections from '../pages/StudentSections';
import Offerings from '../pages/Offerings';
import Users from '../pages/Users';
import Timeslots from '../pages/Timeslots';
import Enrollments from '../pages/Enrollments';
import AuditLogs from '../pages/AuditLogs';
import Conflicts from '../pages/Conflicts';
import RoomMap from '../pages/RoomMap';
import Settings from '../pages/Settings'; // ✅ Corregido (asegúrate de tener src/pages/Settings.jsx)

// 🧱 Layout del panel
import DashboardLayout from '../layouts/DashboardLayout';

export default function AppRouter() {
  return (
    <Routes>
      {/* 🔹 Redirección inicial */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 🔹 Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔹 Dashboard principal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Semestres */}
      <Route
        path="/dashboard/semesters"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <Semesters />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Cursos */}
      <Route
        path="/dashboard/courses"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Courses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Profesores */}
      <Route
        path="/dashboard/teachers"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Teachers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Estudiantes */}
      <Route
        path="/dashboard/students"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Students />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Secciones */}
      <Route
        path="/dashboard/sections"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Sections />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Secciones del estudiante */}
      <Route
        path="/dashboard/student-sections"
        element={
          <ProtectedRoute roles={['admin', 'coordinator', 'student']}>
            <DashboardLayout>
              <StudentSections />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Ofertas */}
      <Route
        path="/dashboard/offerings"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Offerings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
          {/* 🔹 Mapa */}
      <Route
        path="/dashboard/room-map"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <RoomMap />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* 🔹 Usuarios */}
      <Route
        path="/dashboard/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Horarios */}
      <Route
        path="/dashboard/schedules"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Schedules />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Salones */}
      <Route
        path="/dashboard/rooms"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Rooms />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Bloques de tiempo */}
      <Route
        path="/dashboard/timeslots"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Timeslots />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Matrículas */}
      <Route
        path="/dashboard/enrollments"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Enrollments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Reportes */}
      <Route
        path="/dashboard/reports"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Conflictos */}
      <Route
        path="/dashboard/conflicts"
        element={
          <ProtectedRoute roles={['admin', 'coordinator']}>
            <DashboardLayout>
              <Conflicts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Configuración */}
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 Auditoría */}
      <Route
        path="/dashboard/audit-logs"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <AuditLogs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 🔹 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
