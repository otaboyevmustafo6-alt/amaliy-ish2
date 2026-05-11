/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalProvider } from './context/GlobalContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BoardDetails from './pages/BoardDetails';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { state } = useAuth();

  if (!state.initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!state.user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!state.user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/" element={state.user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/board/:boardId" element={state.user ? <BoardDetails /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalProvider>
          <AppRoutes />
        </GlobalProvider>
      </AuthProvider>
    </Router>
  );
}
