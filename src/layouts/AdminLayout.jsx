import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
  const { userRole, isConnected, isRegistered } = useWeb3();
  
  // Redirect if not admin or not connected
  if (!isConnected || !isRegistered) {
    return <Navigate to="/login" />;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;