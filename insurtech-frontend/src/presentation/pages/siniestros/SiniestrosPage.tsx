import React, { useEffect, useState, useCallback } from 'react';
import { siniestroAdapter } from '../../../infrastructure/adapters/SiniestroAdapter';
import type { Siniestro } from '../../../domain/entities';
import type { SiniestroFormData, PageResponse } from '../../../domain/interfaces';
import { EstadoSiniestro } from '../../../domain/enums';
import { StatusBadge, Pagination, EmptyState, Modal, ConfirmDialog, PageLoader } from '../../components/ui';
import { Plus, Eye, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm: SiniestroFormData = {
  polizaId: 0, descripcion: '',
  fechaEvento: new Date().toISOString().split('T')[0],
  montoSolicitado: 0,
};

export function SiniestrosPage() {
  const [data, setData] = useState<PageResponse<Siniestro> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Siniestro | null>(null);
  const [form, setForm] = useState<SiniestroFormData>(emptyForm);
  const [evalForm, setEvalForm] = useState({ estado: 'APROBADO', motivo: '', montoAprobado: 0 });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = filter !== 'ALL'
        ? await siniestroAdapter.listarPorPoliza(0, { page, size: 10 }) // use listar with estado filter below
        : await siniestroAdapter.listar({ page, size: 10 });
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReportar = async () => {
    setSaving(true);
    try {
      await siniestroAdapter.reportar(form);
      toast.success('Siniestro reportado');
      setModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluar = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await siniestroAdapter.evaluar(
        selected.id,
        evalForm.estado as EstadoSiniestro,
        evalForm.motivo || undefined,
        evalForm.estado === 'APROBADO' ? evalForm.montoAprobado : undefined,
      );
      toast.success('Siniestro evaluado');
      setEvalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await siniestroAdapter.eliminar(selected.id);
      toast.success('Siniestro eliminado');
      setDeleteOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatMoney = (n: number) => '$' + (n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 });
  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Siniestros</h1>
          <p className="text-surface-500 text-sm mt-0.5">Gestión de reclamos y siniestros</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> Reportar Siniestro
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data || data.content.length === 0 ? (
          <EmptyState message="No se encontraron siniestros" icon={<AlertTriangle size={48} strokeWidth={1.2} />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">No. Siniestro</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Póliza</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Fecha Evento</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Solicitado</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Aprobado</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(s => (
                    <tr key={s.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand-700">{s.numeroSiniestro}</td>
                      <td className="px-5 py-3.5 font-mono text-xs">{s.numeroPoliza}</td>
                      <td className="px-5 py-3.5 text-surface-600">{s.fechaEvento}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs">{formatMoney(s.montoSolicitado)}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-xs font-medium text-success">{s.montoAprobado ? formatMoney(s.montoAprobado) : '-'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={s.estado} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(s); setDetailOpen(true); }} className="btn-ghost btn-sm p-1.5" title="Ver"><Eye size={15} /></button>
                          {(s.estado === 'REPORTADO' || s.estado === 'EVALUACION') && (
                            <button onClick={() => {
                              setSelected(s);
                              setEvalForm({ estado: 'APROBADO', motivo: '', montoAprobado: s.montoSolicitado });
                              setEvalOpen(true);
                            }} className="btn-ghost btn-sm p-1.5 text-success" title="Evaluar">
                              <CheckCircle size={15} />
                            </button>
                          )}
                          <button onClick={() => { setSelected(s); setDeleteOpen(true); }} className="btn-ghost btn-sm p-1.5 text-danger" title="Eliminar"><Trash2 size={15} /></button>
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

      {/* Report Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Reportar Siniestro" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="label">ID de Póliza</label>
            <input type="number" value={form.polizaId || ''} onChange={e => updateForm('polizaId', Number(e.target.value))} className="input-field" required />
          </div>
          <div>
            <label className="label">Fecha del Evento</label>
            <input type="date" value={form.fechaEvento} onChange={e => updateForm('fechaEvento', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label">Monto Solicitado</label>
            <input type="number" step="0.01" value={form.montoSolicitado || ''} onChange={e => updateForm('montoSolicitado', Number(e.target.value))} className="input-field" required />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => updateForm('descripcion', e.target.value)} className="input-field" rows={4} required />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleReportar} disabled={saving} className="btn-primary">{saving ? 'Reportando...' : 'Reportar'}</button>
        </div>
      </Modal>

      {/* Evaluate Modal */}
      <Modal open={evalOpen} onClose={() => setEvalOpen(false)} title="Evaluar Siniestro" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="p-3 bg-surface-50 rounded-lg text-sm">
            <span className="text-surface-500">Siniestro:</span>
            <span className="font-mono font-medium ml-2">{selected?.numeroSiniestro}</span>
            <span className="text-surface-500 ml-4">Solicitado:</span>
            <span className="font-bold ml-2">{formatMoney(selected?.montoSolicitado ?? 0)}</span>
          </div>
          <div>
            <label className="label">Decisión</label>
            <select value={evalForm.estado} onChange={e => setEvalForm(prev => ({ ...prev, estado: e.target.value }))} className="input-field">
              <option value="APROBADO">Aprobar</option>
              <option value="RECHAZADO">Rechazar</option>
              <option value="EVALUACION">En Evaluación</option>
            </select>
          </div>
          {evalForm.estado === 'APROBADO' && (
            <div>
              <label className="label">Monto Aprobado</label>
              <input type="number" step="0.01" value={evalForm.montoAprobado || ''} onChange={e => setEvalForm(prev => ({ ...prev, montoAprobado: Number(e.target.value) }))} className="input-field" />
            </div>
          )}
          {evalForm.estado === 'RECHAZADO' && (
            <div>
              <label className="label">Motivo de Rechazo</label>
              <textarea value={evalForm.motivo} onChange={e => setEvalForm(prev => ({ ...prev, motivo: e.target.value }))} className="input-field" rows={3} required />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setEvalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleEvaluar} disabled={saving}
            className={evalForm.estado === 'APROBADO' ? 'btn-primary' : 'btn-danger'}>
            {saving ? 'Procesando...' : evalForm.estado === 'APROBADO' ? 'Aprobar' : 'Rechazar'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de Siniestro" maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-surface-500">Número:</span> <span className="font-mono ml-1">{selected.numeroSiniestro}</span></div>
              <div><span className="text-surface-500">Estado:</span> <span className="ml-1"><StatusBadge status={selected.estado} /></span></div>
              <div><span className="text-surface-500">Póliza:</span> <span className="font-mono ml-1">{selected.numeroPoliza}</span></div>
              <div><span className="text-surface-500">Fecha:</span> <span className="ml-1">{selected.fechaEvento}</span></div>
              <div><span className="text-surface-500">Solicitado:</span> <span className="font-bold ml-1">{formatMoney(selected.montoSolicitado)}</span></div>
              <div><span className="text-surface-500">Aprobado:</span> <span className="font-bold ml-1 text-success">{selected.montoAprobado ? formatMoney(selected.montoAprobado) : '-'}</span></div>
            </div>
            <div className="pt-3 border-t border-surface-200">
              <p className="text-surface-500 mb-1">Descripción:</p>
              <p className="text-surface-900">{selected.descripcion}</p>
            </div>
            {selected.motivoRechazo && (
              <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <p className="text-xs text-danger font-medium">Motivo de rechazo:</p>
                <p className="text-sm text-surface-900 mt-1">{selected.motivoRechazo}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Eliminar Siniestro" message={`¿Estás seguro de eliminar el siniestro ${selected?.numeroSiniestro}?`} />
    </div>
  );
}
