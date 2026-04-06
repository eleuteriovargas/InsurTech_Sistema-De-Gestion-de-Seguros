import React, { useEffect, useState } from 'react';
import { primaAdapter, type PagoData } from '../../../infrastructure/adapters/PrimaAdapter';
import type { Prima } from '../../../domain/entities';
import type { PageResponse } from '../../../domain/interfaces';
import { MetodoPago } from '../../../domain/enums';
import { StatusBadge, Pagination, EmptyState, Modal, PageLoader } from '../../components/ui';
import { CreditCard, Search, Plus, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { polizaAdapter } from '../../../infrastructure/adapters/PolizaAdapter';
import type { Poliza } from '../../../domain/entities';

export function PrimasPage() {
  const [activeTab, setActiveTab] = useState<'poliza' | 'asegurado' | 'generar'>('poliza');

  // Buscar por poliza
  const [polizaId, setPolizaId] = useState<number | ''>('');
  const [primasPoliza, setPrimasPoliza] = useState<PageResponse<Prima> | null>(null);
  const [pagePoliza, setPagePoliza] = useState(0);
  const [loadingPoliza, setLoadingPoliza] = useState(false);

  // Buscar pendientes por asegurado
  const [aseguradoId, setAseguradoId] = useState<number | ''>('');
  const [primasAsegurado, setPrimasAsegurado] = useState<Prima[]>([]);
  const [loadingAsegurado, setLoadingAsegurado] = useState(false);

  // Generar cuotas
  const [genPolizaId, setGenPolizaId] = useState<number | ''>('');
  const [genCuotas, setGenCuotas] = useState(12);
  const [generating, setGenerating] = useState(false);
  const [polizasDisponibles, setPolizasDisponibles] = useState<Poliza[]>([]);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [busquedaPoliza, setBusquedaPoliza] = useState('');

  // Pago modal
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [selectedPrima, setSelectedPrima] = useState<Prima | null>(null);
  const [pagoForm, setPagoForm] = useState<PagoData>({
    monto: 0, metodoPago: MetodoPago.TRANSFERENCIA, referencia: '', numeroAutorizacion: '',
  });
  const [savingPago, setSavingPago] = useState(false);

  const buscarPorPoliza = async () => {
    if (!polizaId) { toast.error('Ingresa un ID de póliza'); return; }
    setLoadingPoliza(true);
    try {
      const result = await primaAdapter.listarPorPoliza(Number(polizaId), pagePoliza, 10);
      setPrimasPoliza(result);
    } catch (err: any) {
      toast.error(err.message);
      setPrimasPoliza(null);
    } finally {
      setLoadingPoliza(false);
    }
  };

  useEffect(() => {
    if (polizaId && activeTab === 'poliza') buscarPorPoliza();
  }, [pagePoliza]);

  const buscarPorAsegurado = async () => {
    if (!aseguradoId) { toast.error('Ingresa un ID de asegurado'); return; }
    setLoadingAsegurado(true);
    try {
      const result = await primaAdapter.pendientesPorAsegurado(Number(aseguradoId));
      setPrimasAsegurado(result);
      if (result.length === 0) toast('No hay primas pendientes', { icon: '✅' });
    } catch (err: any) {
      toast.error(err.message);
      setPrimasAsegurado([]);
    } finally {
      setLoadingAsegurado(false);
    }
  };

  const handleGenerarCuotas = async () => {
    if (!genPolizaId) { toast.error('Ingresa un ID de póliza'); return; }
    setGenerating(true);
    try {
      const cuotas = await primaAdapter.generarCuotas(Number(genPolizaId), genCuotas);
      toast.success(`${cuotas.length} cuotas generadas exitosamente`);
      setGenPolizaId('');
      setGenCuotas(12);
      // Auto-switch to poliza tab
      setPolizaId(Number(genPolizaId));
      setActiveTab('poliza');
      setTimeout(() => buscarPorPoliza(), 300);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const openPagoModal = (prima: Prima) => {
    setSelectedPrima(prima);
    const total = prima.monto + (prima.interesMora || 0);
    setPagoForm({
      monto: Math.round(total * 100) / 100,
      metodoPago: MetodoPago.TRANSFERENCIA,
      referencia: '',
      numeroAutorizacion: '',
    });
    setPagoModalOpen(true);
  };

  const handleRegistrarPago = async () => {
    if (!selectedPrima) return;
    setSavingPago(true);
    try {
      await primaAdapter.registrarPago(selectedPrima.id, pagoForm);
      toast.success('Pago registrado exitosamente');
      setPagoModalOpen(false);
      // Refresh data
      if (activeTab === 'poliza' && polizaId) buscarPorPoliza();
      if (activeTab === 'asegurado' && aseguradoId) buscarPorAsegurado();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPago(false);
    }
  };

  const cargarPolizas = async () => {
  setLoadingPolizas(true);
  try {
    const result = await polizaAdapter.listar({ page: 0, size: 100, sortBy: 'id', sortDir: 'DESC' });
    setPolizasDisponibles(result.content);
  } catch (err: any) {
    toast.error('Error al cargar pólizas');
  } finally {
    setLoadingPolizas(false);
  }
};

useEffect(() => {
  if (activeTab === 'generar' && polizasDisponibles.length === 0) {
    cargarPolizas();
  }
}, [activeTab]);

  const formatMoney = (n: number) => '$' + (n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const tabs = [
    { key: 'poliza', label: 'Por Póliza', icon: Search },
    { key: 'asegurado', label: 'Pendientes por Asegurado', icon: AlertTriangle },
    { key: 'generar', label: 'Generar Cuotas', icon: Plus },
  ] as const;

  const renderPrimaTable = (primas: Prima[], showActions = true) => (
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
            <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Total</th>
            <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
            {showActions && <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Acción</th>}
          </tr>
        </thead>
        <tbody>
          {primas.map(p => {
            const total = p.monto + (p.interesMora || 0);
            const isPagable = p.estado === 'PENDIENTE' || p.estado === 'VENCIDO' || p.estado === 'MOROSO';
            return (
              <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs">{p.numeroPoliza}</td>
                <td className="px-5 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 text-sm font-semibold text-surface-700">
                    {p.numeroCuota}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs font-medium">{formatMoney(p.monto)}</td>
                <td className="px-5 py-3.5 text-surface-600 text-xs">{p.fechaVencimiento}</td>
                <td className="px-5 py-3.5 text-center">
                  {p.diasVencida > 0 ? (
                    <span className={`font-medium ${p.diasVencida > 30 ? 'text-danger' : 'text-warning'}`}>
                      {p.diasVencida} días
                    </span>
                  ) : (
                    <span className="text-surface-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs">
                  {p.interesMora > 0 ? (
                    <span className="text-danger font-medium">{formatMoney(p.interesMora)}</span>
                  ) : (
                    <span className="text-surface-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-xs font-bold text-surface-900">{formatMoney(total)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.estado} /></td>
                {showActions && (
                  <td className="px-5 py-3.5 text-right">
                    {isPagable ? (
                      <button onClick={() => openPagoModal(p)} className="btn-primary btn-sm">
                        <DollarSign size={13} /> Pagar
                      </button>
                    ) : (
                      <span className="text-xs text-surface-400">
                        {p.estado === 'PAGADO' ? '✅ Pagado' : '—'}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Stats para la tabla actual
  const getStats = (primas: Prima[]) => {
    const pendientes = primas.filter(p => p.estado !== 'PAGADO');
    const pagadas = primas.filter(p => p.estado === 'PAGADO');
    const totalPendiente = pendientes.reduce((sum, p) => sum + p.monto + (p.interesMora || 0), 0);
    const totalPagado = pagadas.reduce((sum, p) => sum + p.monto, 0);
    const totalMora = pendientes.reduce((sum, p) => sum + (p.interesMora || 0), 0);
    return { pendientes: pendientes.length, pagadas: pagadas.length, totalPendiente, totalPagado, totalMora };
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Gestión de Primas</h1>
        <p className="text-surface-500 text-sm mt-0.5">Cuotas, pagos y mora de pólizas</p>
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

      {/* Tab: Por Póliza */}
      {activeTab === 'poliza' && (
        <div>
          <div className="card p-4 mb-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs">
                <label className="label">ID de Póliza</label>
                <input type="number" value={polizaId} onChange={e => setPolizaId(e.target.value ? Number(e.target.value) : '')}
                  className="input-field" placeholder="Ej: 1"
                  onKeyDown={e => e.key === 'Enter' && buscarPorPoliza()} />
              </div>
              <button onClick={buscarPorPoliza} className="btn-primary" disabled={loadingPoliza}>
                <Search size={16} /> {loadingPoliza ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            {loadingPoliza ? <PageLoader /> :
              !primasPoliza ? (
                <EmptyState message="Ingresa un ID de póliza para ver sus cuotas" icon={<CreditCard size={48} strokeWidth={1.2} />} />
              ) : primasPoliza.content.length === 0 ? (
                <EmptyState message="No hay cuotas para esta póliza" />
              ) : (
                <>
                  {/* Stats bar */}
                  {(() => {
                    const stats = getStats(primasPoliza.content);
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-50/50 border-b border-surface-200">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-warning" />
                          <div>
                            <p className="text-xs text-surface-500">Pendientes</p>
                            <p className="font-bold text-surface-900">{stats.pendientes}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-success" />
                          <div>
                            <p className="text-xs text-surface-500">Pagadas</p>
                            <p className="font-bold text-success">{stats.pagadas}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-danger" />
                          <div>
                            <p className="text-xs text-surface-500">Total Pendiente</p>
                            <p className="font-bold text-danger">{formatMoney(stats.totalPendiente)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-warning" />
                          <div>
                            <p className="text-xs text-surface-500">Mora Acumulada</p>
                            <p className="font-bold text-warning">{formatMoney(stats.totalMora)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {renderPrimaTable(primasPoliza.content)}
                  <div className="px-5 py-3 border-t border-surface-100">
                    <Pagination currentPage={primasPoliza.currentPage} totalPages={primasPoliza.totalPages} onPageChange={setPagePoliza} />
                  </div>
                </>
              )}
          </div>
        </div>
      )}

      {/* Tab: Pendientes por Asegurado */}
      {activeTab === 'asegurado' && (
        <div>
          <div className="card p-4 mb-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs">
                <label className="label">ID del Asegurado</label>
                <input type="number" value={aseguradoId} onChange={e => setAseguradoId(e.target.value ? Number(e.target.value) : '')}
                  className="input-field" placeholder="Ej: 1"
                  onKeyDown={e => e.key === 'Enter' && buscarPorAsegurado()} />
              </div>
              <button onClick={buscarPorAsegurado} className="btn-primary" disabled={loadingAsegurado}>
                <Search size={16} /> {loadingAsegurado ? 'Buscando...' : 'Buscar Pendientes'}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            {loadingAsegurado ? <PageLoader /> :
              primasAsegurado.length === 0 ? (
                <EmptyState message="Ingresa un ID de asegurado para ver sus primas pendientes" icon={<AlertTriangle size={48} strokeWidth={1.2} />} />
              ) : (
                <>
                  <div className="p-4 bg-danger/5 border-b border-danger/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-danger" />
                      <span className="text-sm font-medium text-danger">
                        {primasAsegurado.length} cuota{primasAsegurado.length !== 1 ? 's' : ''} pendiente{primasAsegurado.length !== 1 ? 's' : ''} — Total:
                        <span className="font-bold ml-1">
                          {formatMoney(primasAsegurado.reduce((s, p) => s + p.monto + (p.interesMora || 0), 0))}
                        </span>
                      </span>
                    </div>
                  </div>
                  {renderPrimaTable(primasAsegurado)}
                </>
              )}
          </div>
        </div>
      )}

{/* Tab: Generar Cuotas */}
{activeTab === 'generar' && (
  <div>
    <div className="card p-6 mb-5">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-brand-100 rounded-xl">
          <Plus size={20} className="text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-surface-900">Generar Cuotas</h3>
          <p className="text-xs text-surface-500">Selecciona una póliza y define el número de cuotas mensuales</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <label className="label">Buscar póliza</label>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={busquedaPoliza}
            onChange={e => setBusquedaPoliza(e.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por número de póliza, nombre del asegurado o tipo..." />
        </div>
      </div>

      {/* Lista de pólizas */}
      {loadingPolizas ? <PageLoader /> : (
        <div className="border border-surface-200 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
          {polizasDisponibles
            .filter(p => {
              if (!busquedaPoliza) return true;
              const term = busquedaPoliza.toLowerCase();
              return p.numeroPoliza.toLowerCase().includes(term)
                || p.aseguradoNombre.toLowerCase().includes(term)
                || p.tipoPoliza.toLowerCase().includes(term);
            })
            .map(p => {
              const isSelected = genPolizaId === p.id;
              const tieneCuotas = p.totalPrimas > 0;
              return (
                <button key={p.id}
                  onClick={() => setGenPolizaId(p.id)}
                  className={`w-full flex items-center justify-between p-4 text-left border-b border-surface-100 last:border-b-0 transition-colors
                    ${isSelected ? 'bg-brand-50 border-l-4 border-l-brand-600' : 'hover:bg-surface-50'}
                    ${tieneCuotas ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold
                      ${isSelected ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600'}`}>
                      {p.tipoPoliza.substring(0, 3)}
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium text-surface-900">{p.numeroPoliza}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{p.aseguradoNombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.estado} />
                      {tieneCuotas ? (
                        <span className="badge-warning text-[10px]">
                          {p.totalPrimas} cuotas existentes
                        </span>
                      ) : (
                        <span className="badge-success text-[10px]">Sin cuotas</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                      Prima: {formatMoney(p.primaTotal)}
                    </p>
                  </div>
                </button>
              );
            })}
          {polizasDisponibles.filter(p => {
            if (!busquedaPoliza) return true;
            const term = busquedaPoliza.toLowerCase();
            return p.numeroPoliza.toLowerCase().includes(term)
              || p.aseguradoNombre.toLowerCase().includes(term)
              || p.tipoPoliza.toLowerCase().includes(term);
          }).length === 0 && (
            <div className="p-8 text-center text-surface-400 text-sm">
              No se encontraron pólizas
            </div>
          )}
        </div>
      )}
    </div>

    {/* Panel de generación (aparece al seleccionar póliza) */}
    {genPolizaId && (() => {
      const polizaSel = polizasDisponibles.find(p => p.id === genPolizaId);
      if (!polizaSel) return null;
      const montoCuota = polizaSel.primaTotal / genCuotas;
      return (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-start gap-4 mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {polizaSel.tipoPoliza.substring(0, 3)}
            </div>
            <div className="flex-1">
              <p className="font-mono font-semibold text-brand-800">{polizaSel.numeroPoliza}</p>
              <p className="text-sm text-brand-700">{polizaSel.aseguradoNombre}</p>
              <div className="flex gap-4 mt-2 text-xs text-brand-600">
                <span>Prima Total: <strong>{formatMoney(polizaSel.primaTotal)}</strong></span>
                <span>Vigencia: {polizaSel.fechaInicio} → {polizaSel.fechaFin}</span>
              </div>
            </div>
          </div>

          {polizaSel.totalPrimas > 0 && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning shrink-0" />
              <p className="text-sm text-warning">
                Esta póliza ya tiene <strong>{polizaSel.totalPrimas} cuotas</strong>. No se pueden generar más mientras existan cuotas pendientes.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label">Número de Cuotas</label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={24} value={genCuotas}
                  onChange={e => setGenCuotas(Number(e.target.value))}
                  className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
                <span className="inline-flex items-center justify-center w-12 h-10 rounded-lg bg-brand-100 text-brand-700 font-bold text-lg">
                  {genCuotas}
                </span>
              </div>
            </div>

            <div className="p-4 bg-surface-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-surface-500">Prima Total</p>
                  <p className="text-lg font-bold text-surface-900">{formatMoney(polizaSel.primaTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">÷ {genCuotas} cuotas</p>
                  <p className="text-lg font-bold text-brand-700">{formatMoney(Math.round(montoCuota * 100) / 100)}</p>
                  <p className="text-[10px] text-surface-400">por cuota</p>
                </div>
                <div>
                  <p className="text-xs text-surface-500">Frecuencia</p>
                  <p className="text-lg font-bold text-surface-900">Mensual</p>
                </div>
              </div>
            </div>

            <button onClick={handleGenerarCuotas}
              disabled={generating || polizaSel.totalPrimas > 0}
              className="btn-primary w-full btn-lg">
              {generating ? 'Generando...' : `Generar ${genCuotas} Cuotas de ${formatMoney(Math.round(montoCuota * 100) / 100)}`}
            </button>
          </div>
        </div>
      );
    })()}
  </div>
)}

      {/* Pago Modal */}
      <Modal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} title="Registrar Pago" maxWidth="max-w-md">
        {selectedPrima && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-50 rounded-xl">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-surface-500">Póliza</p>
                  <p className="font-mono font-medium">{selectedPrima.numeroPoliza}</p>
                </div>
                <div>
                  <p className="text-surface-500">Cuota</p>
                  <p className="font-bold"># {selectedPrima.numeroCuota}</p>
                </div>
                <div>
                  <p className="text-surface-500">Monto Base</p>
                  <p className="font-medium">{formatMoney(selectedPrima.monto)}</p>
                </div>
                <div>
                  <p className="text-surface-500">Mora</p>
                  <p className="font-medium text-danger">
                    {selectedPrima.interesMora > 0 ? formatMoney(selectedPrima.interesMora) : '$0.00'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-200 flex justify-between items-center">
                <span className="text-sm font-medium text-surface-700">Total a Pagar</span>
                <span className="text-xl font-bold text-brand-700">
                  {formatMoney(selectedPrima.monto + (selectedPrima.interesMora || 0))}
                </span>
              </div>
            </div>

            <div>
              <label className="label">Monto del Pago</label>
              <input type="number" step="0.01" value={pagoForm.monto}
                onChange={e => setPagoForm(prev => ({ ...prev, monto: Number(e.target.value) }))}
                className="input-field" />
            </div>

            <div>
              <label className="label">Método de Pago</label>
              <select value={pagoForm.metodoPago}
                onChange={e => setPagoForm(prev => ({ ...prev, metodoPago: e.target.value }))}
                className="input-field">
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="AUTOMATICO">Automático</option>
              </select>
            </div>

            <div>
              <label className="label">Referencia de Transacción</label>
              <input value={pagoForm.referencia || ''}
                onChange={e => setPagoForm(prev => ({ ...prev, referencia: e.target.value }))}
                className="input-field" placeholder="Número de referencia bancaria" />
            </div>

            <div>
              <label className="label">Número de Autorización</label>
              <input value={pagoForm.numeroAutorizacion || ''}
                onChange={e => setPagoForm(prev => ({ ...prev, numeroAutorizacion: e.target.value }))}
                className="input-field" placeholder="Opcional" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setPagoModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleRegistrarPago} disabled={savingPago} className="btn-primary">
            <DollarSign size={16} />
            {savingPago ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
