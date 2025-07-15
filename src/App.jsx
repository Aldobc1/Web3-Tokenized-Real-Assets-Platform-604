import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';
import { TokenSalesProvider } from './contexts/TokenSalesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import AssetDetail from './pages/AssetDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminOperators from './pages/AdminOperators';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminDashboard from './pages/AdminDashboard';
import AdminSmartContracts from './pages/AdminSmartContracts';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Web3Provider>
          <TokenSalesProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Header />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/asset/:id" element={<AssetDetail />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="operators" element={<AdminOperators />} />
                    <Route path="opportunities" element={<AdminOpportunities />} />
                    <Route path="smart-contracts" element={<AdminSmartContracts />} />
                  </Route>

                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </TokenSalesProvider>
        </Web3Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;