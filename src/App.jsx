import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          {/* Página de Login */}
          <Route path="/login" element={<Login />} />

          {/* Páginas principais com navegação */}
          <Route path="/dashboard" element={
            <>
              <Navigation />
              <Dashboard />
            </>
          } />
          <Route path="/expenses" element={
            <>
              <Navigation />
              <Expenses />
            </>
          } />
          <Route path="/goals" element={
            <>
              <Navigation />
              <Goals />
            </>
          } />
          <Route path="/reports" element={
            <>
              <Navigation />
              <Reports />
            </>
          } />

          {/* Redirect para login por padrão */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
