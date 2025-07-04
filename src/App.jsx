import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import AssetDetail from './pages/AssetDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminOperators from './pages/AdminOperators';
import AdminOpportunities from './pages/AdminOpportunities';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Web3Provider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/asset/:id" element={<AssetDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/operators" element={<AdminOperators />} />
                <Route path="/admin/opportunities" element={<AdminOpportunities />} />
              </Routes>
            </div>
          </Router>
        </Web3Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;