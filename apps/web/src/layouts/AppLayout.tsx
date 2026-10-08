import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, CheckSquare, LogOut, Menu, X, Layout } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header d-md-none" style={{ display: 'none' }}>
        <div className="flex items-center gap-2 font-bold">
          <Layout className="icon" size={24} color="var(--primary)" />
          PMS
        </div>
        <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layout className="icon" size={28} />
            <span>PMS</span>
          </div>
          <button className="mobile-nav-toggle" onClick={closeSidebar} style={{ display: sidebarOpen ? 'block' : 'none' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Briefcase size={20} />
            Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <CheckSquare size={20} />
            All Tasks
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div className="text-sm text-muted">Signed in as</div>
            <div className="font-bold">{user?.fullName}</div>
          </div>
          <button className="nav-link w-100" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
