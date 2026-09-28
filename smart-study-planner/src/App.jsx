import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Layout         from './components/layout/Layout';

/* Admin shared component styles */
import './pages/admin/AdminLayout.css';

/* Admin Pages */
import AdminDashboard     from './pages/admin/AdminDashboard';
import UserManagement     from './pages/admin/UserManagement';
import NotificationCenter from './pages/admin/NotificationCenter';
import AdminAnalytics     from './pages/admin/Analytics';
import AdminSettings      from './pages/admin/Settings';

/* Landing */
import LandingPage from './pages/landing/LandingPage';

/* Auth Pages */
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import OAuth2Callback from './pages/auth/OAuth2Callback';

/* App Pages */
import Dashboard     from './pages/dashboard/Dashboard';
import Profile       from './pages/profile/Profile';
import Subjects      from './pages/subjects/Subjects';
import Tasks         from './pages/tasks/Tasks';
import Notes         from './pages/notes/Notes';
import Goals         from './pages/goals/Goals';
import Timetable     from './pages/timetable/Timetable';
import Planner       from './pages/planner/Planner';
import Progress      from './pages/progress/Progress';
import Pomodoro      from './pages/pomodoro/Pomodoro';
import AiAssistant   from './pages/ai/AiAssistant';
import Notifications from './pages/notifications/Notifications';
import Settings      from './pages/settings/Settings';
import Analytics     from './pages/analytics/Analytics';

/* Error */
import NotFound from './pages/error/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Landing page — public root */}
            <Route path="/" element={<LandingPage />} />

            {/* Public auth routes */}
            <Route path="/login"            element={<Login />} />
            <Route path="/register"         element={<Register />} />
            <Route path="/forgot-password"  element={<ForgotPassword />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/oauth2/callback"  element={<OAuth2Callback />} />

            {/* Admin Routes — use shared Layout shell */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Layout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard"     element={<AdminDashboard />} />
              <Route path="users"         element={<UserManagement />} />
              <Route path="notifications" element={<NotificationCenter />} />
              <Route path="analytics"     element={<AdminAnalytics />} />
              <Route path="settings"      element={<AdminSettings />} />
            </Route>

            {/* Protected app routes — pathless layout keeps URLs unchanged */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/profile"       element={<Profile />} />
              <Route path="/subjects"      element={<Subjects />} />
              <Route path="/tasks"         element={<Tasks />} />
              <Route path="/notes"         element={<Notes />} />
              <Route path="/goals"         element={<Goals />} />
              <Route path="/timetable"     element={<Timetable />} />
              <Route path="/planner"       element={<Planner />} />
              <Route path="/progress"      element={<Progress />} />
              <Route path="/pomodoro"      element={<Pomodoro />} />
              <Route path="/ai"            element={<AiAssistant />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings"      element={<Settings />} />
              <Route path="/analytics"     element={<Analytics />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="dark"
            style={{ zIndex: 9999 }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
