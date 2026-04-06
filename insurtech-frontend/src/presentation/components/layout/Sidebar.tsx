import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, AlertTriangle,
  LogOut, Shield, ChevronLeft, ChevronRight, UserCog,
  Home, CreditCard,
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rol = user?.rol || '';
  const rolLabel = rol.replace('ROLE_', '');
  const isAdmin = rol === 'ROLE_ADMIN';
  const isAgent = rol === 'ROLE_AGENT';
  const isEvaluator = rol === 'ROLE_EVALUATOR';
  const isFinance = rol === 'ROLE_FINANCE';
  const isCustomer = rol === 'ROLE_CUSTOMER';

  const navItems = [
    // Admin & internal staff
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !isCustomer },
    { to: '/asegurados', label: 'Asegurados', icon: Users, show: isAdmin || isAgent },
    { to: '/polizas', label: 'Pólizas', icon: FileText, show: isAdmin || isAgent },
    { to: '/siniestros', label: 'Siniestros', icon: AlertTriangle, show: isAdmin || isAgent || isEvaluator },
    { to: '/primas', label: 'Primas', icon: CreditCard, show: isAdmin || isFinance },
    { to: '/usuarios', label: 'Usuarios', icon: UserCog, show: isAdmin },
    // Customer portal
    { to: '/portal', label: 'Mi Portal', icon: Home, show: isCustomer },
  ];

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen flex flex-col bg-surface-900 text-white transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 shrink-0">
          <Shield size={18} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-wide truncate">InsurTech</h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest">
              {isCustomer ? 'Portal Cliente' : 'Gestión de Seguros'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.filter(item => item.show).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                : 'text-surface-400 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }>
            <Icon size={19} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-300 uppercase shrink-0">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-surface-200 truncate">{user?.username}</p>
              <p className="text-[10px] text-surface-500 uppercase tracking-wide">{rolLabel}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-red-400 hover:bg-red-400/10 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-800 border border-surface-700 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

