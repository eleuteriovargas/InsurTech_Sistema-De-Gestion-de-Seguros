import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAdapter, type DashboardStats } from '../../../infrastructure/adapters/DashboardAdapter';
import { PageLoader } from '../../components/ui';
import { Users, FileText, AlertTriangle, ShieldCheck, TrendingUp, Clock } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAdapter.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { label: 'Asegurados', value: stats?.totalAsegurados ?? 0, icon: Users, color: 'bg-brand-600', accent: 'text-brand-600' },
    { label: 'Pólizas Totales', value: stats?.totalPolizas ?? 0, icon: FileText, color: 'bg-emerald-600', accent: 'text-emerald-600' },
    { label: 'Pólizas Vigentes', value: stats?.polizasVigentes ?? 0, icon: ShieldCheck, color: 'bg-violet-600', accent: 'text-violet-600' },
    { label: 'Siniestros', value: stats?.totalSiniestros ?? 0, icon: AlertTriangle, color: 'bg-amber-600', accent: 'text-amber-600' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">
          Hola, {user?.username} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-surface-500 mt-1">Aquí tienes el resumen de tu sistema de seguros</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon, color, accent }) => (
          <div key={label} className="card p-5 hover:shadow-elevated transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-bold mt-2 ${accent}`}>{value.toLocaleString()}</p>
              </div>
              <div className={`${color} p-2.5 rounded-xl text-white/90 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={18} className="text-amber-600" />
            </div>
            <h3 className="font-semibold text-surface-900">Siniestros Pendientes</h3>
          </div>
          <p className="text-4xl font-bold text-amber-600">{stats?.siniestrosPendientes ?? 0}</p>
          <p className="text-sm text-surface-500 mt-2">Siniestros en espera de evaluación</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <h3 className="font-semibold text-surface-900">Tasa de Cobertura</h3>
          </div>
          <p className="text-4xl font-bold text-emerald-600">
            {stats && stats.totalPolizas > 0
              ? Math.round((stats.polizasVigentes / stats.totalPolizas) * 100)
              : 0}%
          </p>
          <p className="text-sm text-surface-500 mt-2">Pólizas vigentes del total</p>
        </div>
      </div>

      {/* System info */}
      <div className="mt-8 card p-5">
        <h3 className="font-semibold text-surface-900 mb-3">Información del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-surface-500">Rol:</span> <span className="font-medium ml-1">{user?.rol?.replace('ROLE_', '')}</span></div>
          <div><span className="text-surface-500">API:</span> <span className="font-mono text-xs ml-1 badge-neutral">/api/v1</span></div>
          <div><span className="text-surface-500">Arquitectura:</span> <span className="font-medium ml-1">Hexagonal</span></div>
          <div><span className="text-surface-500">Versión:</span> <span className="font-medium ml-1">1.0.0</span></div>
        </div>
      </div>
    </div>
  );
}
