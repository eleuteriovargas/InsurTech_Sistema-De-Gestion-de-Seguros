import React, { useEffect, useState } from 'react';
import { portalAdapter, type ClienteResumen } from '../../../infrastructure/adapters/PortalAdapter';
import type { Poliza, Siniestro, Prima } from '../../../domain/entities';
import type { SiniestroFormData } from '../../../domain/interfaces';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PageLoader, Modal, EmptyState } from '../../components/ui';
import {
  FileText, AlertTriangle, CreditCard, User,
  ShieldCheck, Plus, Clock, DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

const emptySiniestroForm: SiniestroFormData = {
  polizaId: 0, descripcion: '', fechaEvento: new Date().toISOString().split('T')[0], montoSolicitado: 0,
};

export function PortalPage() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState<ClienteResumen | null>(null);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [siniestros, setSiniestros] = useState<Siniestro[]>([]);
  const [primas, setPrimas] = useState<Prima[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'polizas' | 'siniestros' | 'pagos'>('resumen');
  const [siniestroModalOpen, setSiniestroModalOpen] = useState(false);
  const [siniestroForm, setSiniestroForm] = useState<SiniestroFormData>(emptySiniestroForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [res, pol, sin, pri] = await Promise.all([
        portalAdapter.getResumen(),
        portalAdapter.getMisPolizas().then(r => r.content),
        portalAdapter.getMisSiniestros(),
        portalAdapter.getMisPrimas(),
      ]);
      setResumen(res);
      setPolizas(pol);
      setSiniestros(sin);
      setPrimas(pri);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleReportarSiniestro = async () => {
    setSaving(true);
    try {
      await portalAdapter.reportarSiniestro(siniestroForm);
      toast.success('Siniestro reportado exitosamente');
      setSiniestroModalOpen(false);
      setSiniestroForm(emptySiniestroForm);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (n: number) => '$' + (n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-warning" />
          </div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">No se pudo cargar tu portal</h2>
          <p className="text-sm text-surface-500 max-w-md mx-auto">{error}</p>
          <p className="text-xs text-surface-400 mt-4">Si el problema persiste, contacta al administrador del sistema.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'resumen', label: 'Mi Resumen', icon: User },
    { key: 'polizas', label: 'Mis Pólizas', icon: FileText },
    { key: 'siniestros', label: 'Mis Siniestros', icon: AlertTriangle },
    { key: 'pagos', label: 'Pagos Pendientes', icon: CreditCard },
  ] as const;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Mi Portal</h1>
        <p className="text-surface-500 text-sm mt-0.5">
          Bienvenido, {resumen?.nombreCompleto || user?.username}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 p-1 rounded-xl w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === key ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {activeTab === 'resumen' && resumen && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-brand-100 rounded-lg"><FileText size={18} className="text-brand-600" /></div>
                <span className="text-xs text-surface-500 uppercase font-medium">Pólizas</span>
              </div>
              <p className="text-3xl font-bold text-surface-900">{resumen.totalPolizas}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg"><ShieldCheck size={18} className="text-emerald-600" /></div>
                <span className="text-xs text-surface-500 uppercase font-medium">Vigentes</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{resumen.polizasVigentes}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg"><AlertTriangle size={18} className="text-amber-600" /></div>
                <span className="text-xs text-surface-500 uppercase font-medium">Siniestros</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{resumen.totalSiniestros}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg"><DollarSign size={18} className="text-red-600" /></div>
                <span className="text-xs text-surface-500 uppercase font-medium">Deuda</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{formatMoney(resumen.montoTotalPendiente)}</p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <User size={18} /> Mi Información
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-surface-500">Nombre:</span><p className="font-medium mt-0.5">{resumen.nombreCompleto}</p></div>
              <div><span className="text-surface-500">Email:</span><p className="font-medium mt-0.5">{resumen.email}</p></div>
              <div><span className="text-surface-500">Estado:</span><p className="mt-0.5"><StatusBadge status={resumen.estado} /></p></div>
              <div><span className="text-surface-500">Nivel de Riesgo:</span><p className="mt-0.5"><StatusBadge status={resumen.nivelRiesgo} /></p></div>
              <div><span className="text-surface-500">Primas Pendientes:</span><p className="font-bold mt-0.5 text-warning">{resumen.primasPendientes}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Polizas */}
      {activeTab === 'polizas' && (
        <div className="card overflow-hidden">
          {polizas.length === 0 ? (
            <EmptyState message="No tienes pólizas activas" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">No. Póliza</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Suma Asegurada</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Prima</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Vigencia</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {polizas.map(p => (
                    <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand-700">{p.numeroPoliza}</td>
                      <td className="px-5 py-3.5"><span className="badge-info">{p.tipoPoliza}</span></td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">{formatMoney(p.sumaAsegurada)}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs font-medium">{formatMoney(p.primaTotal)}</td>
                      <td className="px-5 py-3.5 text-xs text-surface-500">{p.fechaInicio} → {p.fechaFin}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Siniestros */}
      {activeTab === 'siniestros' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setSiniestroModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Reportar Siniestro
            </button>
          </div>
          <div className="card overflow-hidden">
            {siniestros.length === 0 ? (
              <EmptyState message="No has reportado siniestros" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50/80">
                      <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">No. Siniestro</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Póliza</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Fecha</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Solicitado</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Aprobado</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siniestros.map(s => (
                      <tr key={s.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand-700">{s.numeroSiniestro}</td>
                        <td className="px-5 py-3.5 font-mono text-xs">{s.numeroPoliza}</td>
                        <td className="px-5 py-3.5 text-surface-600">{s.fechaEvento}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-xs">{formatMoney(s.montoSolicitado)}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-xs font-medium text-success">{s.montoAprobado ? formatMoney(s.montoAprobado) : '-'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={s.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Pagos Pendientes */}
      {activeTab === 'pagos' && (
        <div className="card overflow-hidden">
          {primas.length === 0 ? (
            <EmptyState message="No tienes pagos pendientes" icon={<CreditCard size={48} strokeWidth={1.2} />} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Póliza</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Cuota</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Monto</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Vencimiento</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Días Vencida</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Mora</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {primas.map(p => (
                    <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs">{p.numeroPoliza}</td>
                      <td className="px-5 py-3.5 text-center font-medium">{p.numeroCuota}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs font-medium">{formatMoney(p.monto)}</td>
                      <td className="px-5 py-3.5 text-surface-600">{p.fechaVencimiento}</td>
                      <td className="px-5 py-3.5 text-center">
                        {p.diasVencida > 0 ? (
                          <span className="text-danger font-medium">{p.diasVencida} días</span>
                        ) : (
                          <span className="text-surface-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs text-danger">{p.interesMora > 0 ? formatMoney(p.interesMora) : '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reportar Siniestro Modal */}
      <Modal open={siniestroModalOpen} onClose={() => setSiniestroModalOpen(false)} title="Reportar Siniestro" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="label">Póliza</label>
            <select value={siniestroForm.polizaId || ''} onChange={e => setSiniestroForm(prev => ({ ...prev, polizaId: Number(e.target.value) }))} className="input-field" required>
              <option value="">Selecciona una póliza</option>
              {polizas.filter(p => p.estado === 'VIGENTE').map(p => (
                <option key={p.id} value={p.id}>{p.numeroPoliza} — {p.tipoPoliza} (Suma: {formatMoney(p.sumaAsegurada)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha del Evento</label>
            <input type="date" value={siniestroForm.fechaEvento}
              onChange={e => setSiniestroForm(prev => ({ ...prev, fechaEvento: e.target.value }))}
              className="input-field" required />
          </div>
          <div>
            <label className="label">Monto Solicitado</label>
            <input type="number" step="0.01" value={siniestroForm.montoSolicitado || ''}
              onChange={e => setSiniestroForm(prev => ({ ...prev, montoSolicitado: Number(e.target.value) }))}
              className="input-field" required />
          </div>
          <div>
            <label className="label">Descripción del evento</label>
            <textarea value={siniestroForm.descripcion}
              onChange={e => setSiniestroForm(prev => ({ ...prev, descripcion: e.target.value }))}
              className="input-field" rows={4} placeholder="Describe lo sucedido con el mayor detalle posible..." required />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setSiniestroModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleReportarSiniestro} disabled={saving} className="btn-primary">
            {saving ? 'Enviando...' : 'Reportar Siniestro'}
          </button>
        </div>
      </Modal>
    </div>
  );
}