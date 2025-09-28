import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GroupProvider } from './contexts/GroupContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { GoalsProvider } from './contexts/GoalsContext';;
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <TransactionsProvider>
          <GoalsProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Routes>
                  {/* Página de Login */}
                  <Route path="/login" element={<Login />} />

                  {/* Páginas principais com navegação e proteção */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Navigation />
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/expenses" element={
                    <ProtectedRoute>
                      <Navigation />
                      <Expenses />
                    </ProtectedRoute>
                  } />
                  <Route path="/income" element={
                    <ProtectedRoute>
                      <Navigation />
                      <Income />
                    </ProtectedRoute>
                  } />
                  <Route path="/goals" element={
                    <ProtectedRoute>
                      <Navigation />
                      <Goals />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Navigation />
                      <Reports />
                    </ProtectedRoute>
                  } />

                  {/* Redirect para dashboard se estiver logado, caso contrário para login */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </Router>
          </GoalsProvider>
        </TransactionsProvider>
      </GroupProvider>
    </AuthProvider>
  );
}

export default App;
