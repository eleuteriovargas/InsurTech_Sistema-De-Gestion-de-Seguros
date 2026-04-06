import React, { useEffect, useState, useCallback } from 'react';
import { aseguradoAdapter } from '../../../infrastructure/adapters/AseguradoAdapter';
import type { Asegurado } from '../../../domain/entities';
import type { AseguradoFormData, PageResponse } from '../../../domain/interfaces';
import { TipoAsegurado, EstadoAsegurado, NivelRiesgo } from '../../../domain/enums';
import { StatusBadge, Pagination, EmptyState, Modal, ConfirmDialog, PageLoader } from '../../components/ui';
import { Plus, Search, Pencil, Trash2, Eye, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm: AseguradoFormData = {
  tipoAsegurado: TipoAsegurado.PERSONA_NATURAL,
  numeroDocumento: '', nombre: '', apellido: '', email: '', telefono: '',
  direccionCiudad: '', direccionEstado: '', direccionPais: 'Mexico',
};

export function AseguradosPage() {
  const [data, setData] = useState<PageResponse<Asegurado> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Asegurado | null>(null);
  const [form, setForm] = useState<AseguradoFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = search
        ? await aseguradoAdapter.buscarPorNombre(search, { page, size: 10 })
        : await aseguradoAdapter.listar({ page, size: 10, sortBy: 'id', sortDir: 'DESC' });
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: Asegurado) => {
    setSelected(a);
    setForm({
      tipoAsegurado: a.tipoAsegurado, numeroDocumento: a.numeroDocumento,
      nombre: a.nombre, apellido: a.apellido || '', email: a.email, telefono: a.telefono,
      razonSocial: a.razonSocial || '', fechaNacimiento: a.fechaNacimiento || '',
      direccionCalle: a.direccionCalle || '', direccionCiudad: a.direccionCiudad || '',
      direccionEstado: a.direccionEstado || '', direccionCodigoPostal: a.direccionCodigoPostal || '',
      direccionPais: a.direccionPais || 'Mexico', nivelRiesgo: a.nivelRiesgo,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected) {
        await aseguradoAdapter.actualizar(selected.id, form);
        toast.success('Asegurado actualizado');
      } else {
        await aseguradoAdapter.crear(form);
        toast.success('Asegurado creado');
      }
      setModalOpen(false);
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
      await aseguradoAdapter.eliminar(selected.id);
      toast.success('Asegurado eliminado');
      setDeleteOpen(false);
      setSelected(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEstado = async (a: Asegurado, estado: EstadoAsegurado) => {
    try {
      await aseguradoAdapter.cambiarEstado(a.id, estado);
      toast.success('Estado actualizado');
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Asegurados</h1>
          <p className="text-surface-500 text-sm mt-0.5">Gestión de clientes asegurados</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nuevo Asegurado
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Buscar por nombre..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="input-field pl-10" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data || data.content.length === 0 ? (
          <EmptyState message="No se encontraron asegurados" icon={<UserPlus size={48} strokeWidth={1.2} />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Documento</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Riesgo</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Pólizas</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(a => (
                    <tr key={a.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-surface-900">{a.nombre} {a.apellido}</p>
                        <p className="text-xs text-surface-500">{a.email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs">{a.numeroDocumento}</td>
                      <td className="px-5 py-3.5">
                        <span className="badge-neutral text-[10px]">{a.tipoAsegurado.replace('PERSONA_', '')}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={a.estado} /></td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${a.nivelRiesgo === 'BAJO' ? 'badge-success' : a.nivelRiesgo === 'MEDIO' ? 'badge-warning' : 'badge-danger'}`}>
                          {a.nivelRiesgo}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">{a.totalPolizas}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelected(a); setDetailOpen(true); }} className="btn-ghost btn-sm p-1.5" title="Ver"><Eye size={15} /></button>
                          <button onClick={() => openEdit(a)} className="btn-ghost btn-sm p-1.5" title="Editar"><Pencil size={15} /></button>
                          {a.estado === 'ACTIVO' && (
                            <button onClick={() => handleEstado(a, EstadoAsegurado.SUSPENDIDO)} className="btn-ghost btn-sm p-1.5 text-warning" title="Suspender">⏸</button>
                          )}
                          {a.estado === 'SUSPENDIDO' && (
                            <button onClick={() => handleEstado(a, EstadoAsegurado.CANCELADO)} className="btn-ghost btn-sm p-1.5 text-danger" title="Cancelar">⛔</button>
                          )}
                          <button onClick={() => { setSelected(a); setDeleteOpen(true); }} className="btn-ghost btn-sm p-1.5 text-danger" title="Eliminar"><Trash2 size={15} /></button>
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Editar Asegurado' : 'Nuevo Asegurado'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo</label>
            <select value={form.tipoAsegurado} onChange={e => updateForm('tipoAsegurado', e.target.value)} className="input-field" disabled={!!selected}>
              <option value="PERSONA_NATURAL">Persona Natural</option>
              <option value="PERSONA_JURIDICA">Persona Jurídica</option>
            </select>
          </div>
          <div>
            <label className="label">No. Documento</label>
            <input value={form.numeroDocumento} onChange={e => updateForm('numeroDocumento', e.target.value)} className="input-field" disabled={!!selected} required />
          </div>
          <div>
            <label className="label">Nombre</label>
            <input value={form.nombre} onChange={e => updateForm('nombre', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label">Apellido</label>
            <input value={form.apellido || ''} onChange={e => updateForm('apellido', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input value={form.telefono} onChange={e => updateForm('telefono', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="label">Ciudad</label>
            <input value={form.direccionCiudad || ''} onChange={e => updateForm('direccionCiudad', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Estado</label>
            <input value={form.direccionEstado || ''} onChange={e => updateForm('direccionEstado', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">País</label>
            <input value={form.direccionPais || ''} onChange={e => updateForm('direccionPais', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Nivel de Riesgo</label>
            <select value={form.nivelRiesgo || 'BAJO'} onChange={e => updateForm('nivelRiesgo', e.target.value)} className="input-field">
              <option value="BAJO">Bajo</option>
              <option value="MEDIO">Medio</option>
              <option value="ALTO">Alto</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : selected ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del Asegurado" maxWidth="max-w-lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-surface-500">ID:</span> <span className="font-medium ml-1">{selected.id}</span></div>
              <div><span className="text-surface-500">Tipo:</span> <span className="font-medium ml-1">{selected.tipoAsegurado}</span></div>
              <div><span className="text-surface-500">Documento:</span> <span className="font-mono ml-1">{selected.numeroDocumento}</span></div>
              <div><span className="text-surface-500">Estado:</span> <span className="ml-1"><StatusBadge status={selected.estado} /></span></div>
              <div><span className="text-surface-500">Nombre:</span> <span className="font-medium ml-1">{selected.nombre} {selected.apellido}</span></div>
              <div><span className="text-surface-500">Email:</span> <span className="ml-1">{selected.email}</span></div>
              <div><span className="text-surface-500">Teléfono:</span> <span className="ml-1">{selected.telefono}</span></div>
              <div><span className="text-surface-500">Riesgo:</span> <span className="font-medium ml-1">{selected.nivelRiesgo}</span></div>
              <div><span className="text-surface-500">Ciudad:</span> <span className="ml-1">{selected.direccionCiudad || '-'}</span></div>
              <div><span className="text-surface-500">Pólizas:</span> <span className="font-bold ml-1">{selected.totalPolizas}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Eliminar Asegurado" message={`¿Estás seguro de eliminar a ${selected?.nombre} ${selected?.apellido}?`} />
    </div>
  );
}
