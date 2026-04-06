import React, { useEffect, useState, useCallback } from 'react';
import { polizaAdapter } from '../../../infrastructure/adapters/PolizaAdapter';
import type { Poliza } from '../../../domain/entities';
import type { PolizaFormData, PageResponse } from '../../../domain/interfaces';
import { TipoPoliza, EstadoPoliza } from '../../../domain/enums';
import { StatusBadge, Pagination, EmptyState, Modal, ConfirmDialog, PageLoader } from '../../components/ui';
import { Plus, Eye, RefreshCw, XCircle, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm: PolizaFormData = {
  aseguradoId: 0, tipoPoliza: TipoPoliza.AUTO, sumaAsegurada: 0,
  fechaInicio: new Date().toISOString().split('T')[0],
  fechaFin: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
};

export function PolizasPage() {
  const [data, setData] = useState<PageResponse<Poliza> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Poliza | null>(null);
  const [form, setForm] = useState<PolizaFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = filter !== 'ALL'
        ? await polizaAdapter.listarPorEstado(filter as EstadoPoliza, { page, size: 10 })
        : await polizaAdapter.listar({ page, size: 10, sortBy: 'id', sortDir: 'DESC' });
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await polizaAdapter.crear(form);
      toast.success('Póliza creada');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRenovar = async (p: Poliza) => {
    try {
      await polizaAdapter.renovar(p.id);
      toast.success('Póliza renovada');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCancelar = async () => {
    if (!selected) return;
    try {
      await polizaAdapter.cancelar(selected.id);
      toast.success('Póliza cancelada');
      setCancelOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await polizaAdapter.eliminar(selected.id);
      toast.success('Póliza eliminada');
      setDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatMoney = (n: number) => '$' + (n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const filters = ['ALL', 'VIGENTE', 'VENCIDA', 'CANCELADA', 'SUSPENDIDA'];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Pólizas</h1>
          <p className="text-surface-500 text-sm mt-0.5">Gestión de pólizas de seguro</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> Nueva Póliza
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(0); }}
              className={`btn-sm rounded-lg ${filter === f ? 'bg-brand-600 text-white' : 'btn-ghost'}`}>
              {f === 'ALL' ? 'Todas' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data || data.content.length === 0 ? (
          <EmptyState message="No se encontraron pólizas" icon={<FileText size={48} strokeWidth={1.2} />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">No. Póliza</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Asegurado</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Suma Asegurada</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Prima Total</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Vigencia</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(p => (
                    <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand-700">{p.numeroPoliza}</td>
                      <td className="px-5 py-3.5 font-medium text-surface-900">{p.aseguradoNombre}</td>
                      <td className="px-5 py-3.5"><span className="badge-info">{p.tipoPoliza}</span></td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">{formatMoney(p.sumaAsegurada)}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs font-medium">{formatMoney(p.primaTotal)}</td>
                      <td className="px-5 py-3.5 text-xs text-surface-500">{p.fechaInicio} → {p.fechaFin}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.estado} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(p); setDetailOpen(true); }} className="btn-ghost btn-sm p-1.5" title="Ver"><Eye size={15} /></button>
                          {p.estado !== 'CANCELADA' && (
                            <button onClick={() => handleRenovar(p)} className="btn-ghost btn-sm p-1.5 text-info" title="Renovar"><RefreshCw size={15} /></button>
                          )}
                          {p.estado !== 'CANCELADA' && (
                            <button onClick={() => { setSelected(p); setCancelOpen(true); }} className="btn-ghost btn-sm p-1.5 text-warning" title="Cancelar"><XCircle size={15} /></button>
                          )}
                          <button onClick={() => { setSelected(p); setDeleteOpen(true); }} className="btn-ghost btn-sm p-1.5 text-danger" title="Eliminar"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-surface-100">
              <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Póliza" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="label">ID del Asegurado</label>
            <input type="number" value={form.aseguradoId || ''} onChange={e => updateForm('aseguradoId', Number(e.target.value))} className="input-field" required />
          </div>
          <div>
            <label className="label">Tipo de Póliza</label>
            <select value={form.tipoPoliza} onChange={e => updateForm('tipoPoliza', e.target.value)} className="input-field">
              {Object.values(TipoPoliza).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Suma Asegurada</label>
            <input type="number" step="0.01" value={form.sumaAsegurada || ''} onChange={e => updateForm('sumaAsegurada', Number(e.target.value))} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha Inicio</label>
              <input type="date" value={form.fechaInicio} onChange={e => updateForm('fechaInicio', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">Fecha Fin</label>
              <input type="date" value={form.fechaFin} onChange={e => updateForm('fechaFin', e.target.value)} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="label">Observaciones</label>
            <textarea value={form.observaciones || ''} onChange={e => updateForm('observaciones', e.target.value)} className="input-field" rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleCreate} disabled={saving} className="btn-primary">{saving ? 'Creando...' : 'Crear Póliza'}</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de Póliza" maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-surface-500">Número:</span> <span className="font-mono ml-1">{selected.numeroPoliza}</span></div>
              <div><span className="text-surface-500">Tipo:</span> <span className="ml-1"><span className="badge-info">{selected.tipoPoliza}</span></span></div>
              <div><span className="text-surface-500">Asegurado:</span> <span className="font-medium ml-1">{selected.aseguradoNombre}</span></div>
              <div><span className="text-surface-500">Estado:</span> <span className="ml-1"><StatusBadge status={selected.estado} /></span></div>
              <div><span className="text-surface-500">Suma Asegurada:</span> <span className="font-bold ml-1">{formatMoney(selected.sumaAsegurada)}</span></div>
              <div><span className="text-surface-500">Prima Total:</span> <span className="font-bold ml-1 text-brand-700">{formatMoney(selected.primaTotal)}</span></div>
              <div><span className="text-surface-500">Vigencia:</span> <span className="ml-1">{selected.fechaInicio} → {selected.fechaFin}</span></div>
              <div><span className="text-surface-500">Siniestros:</span> <span className="font-bold ml-1">{selected.totalSiniestros}</span></div>
            </div>
            {selected.coberturas && selected.coberturas.length > 0 && (
              <div className="pt-3 border-t border-surface-200">
                <p className="font-semibold text-surface-700 mb-2">Coberturas</p>
                <div className="space-y-1.5">
                  {selected.coberturas.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                      <span className="font-medium">{c.nombre}</span>
                      <span className="text-xs text-surface-500">Límite: {formatMoney(c.limiteCobertura)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancelar}
        title="Cancelar Póliza" message={`¿Estás seguro de cancelar la póliza ${selected?.numeroPoliza}?`} />
      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Eliminar Póliza" message={`¿Estás seguro de eliminar la póliza ${selected?.numeroPoliza}?`} />
    </div>
  );
}
