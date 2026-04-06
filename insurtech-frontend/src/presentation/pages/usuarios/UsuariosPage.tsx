import React, { useEffect, useState, useCallback } from 'react';
import { usuarioAdapter, type UsuarioResponse, type CreateUsuarioData } from '../../../infrastructure/adapters/UsuarioAdapter';
import { useAuth } from '../../context/AuthContext';
import { Modal, PageLoader, EmptyState, Pagination } from '../../components/ui';
import { Plus, UserCheck, UserX, ShieldAlert, Users, Link2, KeyRound, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'ROLE_ADMIN', label: 'Administrador', color: 'bg-red-100 text-red-700' },
  { value: 'ROLE_AGENT', label: 'Agente', color: 'bg-blue-100 text-blue-700' },
  { value: 'ROLE_EVALUATOR', label: 'Evaluador', color: 'bg-purple-100 text-purple-700' },
  { value: 'ROLE_FINANCE', label: 'Finanzas', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ROLE_CUSTOMER', label: 'Cliente', color: 'bg-surface-100 text-surface-600' },
];

const emptyForm: CreateUsuarioData = {
  username: '', password: '', email: '', nombreCompleto: '', rol: 'ROLE_AGENT', aseguradoId: null,
};

interface PageData {
  content: UsuarioResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function UsuariosPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateUsuarioData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [vincularModalOpen, setVincularModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioResponse | null>(null);
  const [newRol, setNewRol] = useState('');
  const [vincularAseguradoId, setVincularAseguradoId] = useState<number | ''>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const result = await usuarioAdapter.listar(
        page, 10,
        filterRol || undefined,
        searchTerm || undefined
      );
      setData(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterRol, searchTerm]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  useEffect(() => { setPage(0); }, [filterRol, searchTerm]);

  const handleCrear = async () => {
    if (!form.username || !form.password || !form.email || !form.nombreCompleto) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (form.rol === 'ROLE_CUSTOMER' && !form.aseguradoId) {
      toast.error('Para crear un cliente debes vincular un ID de asegurado');
      return;
    }
    setSaving(true);
    try {
      await usuarioAdapter.crear(form);
      toast.success(`Usuario "${form.username}" creado exitosamente`);
      setModalOpen(false);
      setForm(emptyForm);
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (u: UsuarioResponse) => {
    if (u.username === user?.username) {
      toast.error('No puedes desactivarte a ti mismo');
      return;
    }
    try {
      await usuarioAdapter.cambiarEstado(u.id, !u.activo);
      toast.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCambiarRol = async () => {
    if (!selectedUser || !newRol) return;
    if (selectedUser.username === user?.username) {
      toast.error('No puedes cambiar tu propio rol');
      return;
    }
    try {
      await usuarioAdapter.cambiarRol(selectedUser.id, newRol);
      toast.success(`Rol actualizado a ${getRolLabel(newRol)}`);
      setRolModalOpen(false);
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleVincularAsegurado = async () => {
    if (!selectedUser || !vincularAseguradoId) return;
    try {
      await usuarioAdapter.vincularAsegurado(selectedUser.id, Number(vincularAseguradoId));
      toast.success('Asegurado vinculado exitosamente');
      setVincularModalOpen(false);
      setVincularAseguradoId('');
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCambiarPassword = async () => {
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      await usuarioAdapter.cambiarPassword(selectedUser.id, newPassword);
      toast.success(`Contraseña actualizada para ${selectedUser.username}`);
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getRolInfo = (rol: string) => ROLES.find(r => r.value === rol) || ROLES[4];
  const getRolLabel = (rol: string) => getRolInfo(rol).label;
  const getRolColor = (rol: string) => getRolInfo(rol).color;

  const updateForm = (field: keyof CreateUsuarioData, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Gestión de Usuarios</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {data ? `${data.totalElements} usuario${data.totalElements !== 1 ? 's' : ''} registrado${data.totalElements !== 1 ? 's' : ''}` : 'Administra los usuarios del sistema'}
          </p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar por username, nombre o email..." />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setFilterRol('')}
              className={`btn-sm rounded-lg ${!filterRol ? 'bg-brand-600 text-white' : 'btn-ghost'}`}>
              Todos
            </button>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setFilterRol(r.value)}
                className={`btn-sm rounded-lg ${filterRol === r.value ? 'bg-brand-600 text-white' : 'btn-ghost'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data || data.content.length === 0 ? (
          <EmptyState message={searchTerm || filterRol ? 'No se encontraron usuarios con esos filtros' : 'No hay usuarios registrados'}
            icon={<Users size={48} strokeWidth={1.2} />} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/80">
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Usuario</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Rol</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Asegurado</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-surface-600 text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(u => (
                    <tr key={u.id} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${u.activo ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-400'}`}>
                            {u.username.charAt(0)}
                          </div>
                          <span className={`font-medium ${u.activo ? 'text-surface-900' : 'text-surface-400 line-through'}`}>{u.username}</span>
                          {u.username === user?.username && (
                            <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full font-medium">Tú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-surface-700">{u.nombreCompleto}</td>
                      <td className="px-5 py-3.5 text-surface-500 text-xs">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRolColor(u.rol)}`}>
                          {getRolLabel(u.rol)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.aseguradoNombre ? (
                          <div>
                            <p className="text-xs font-medium text-surface-900">{u.aseguradoNombre}</p>
                            <p className="text-[10px] text-surface-400">ID: {u.aseguradoId}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-400">Sin vincular</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.activo ? <span className="badge-success">Activo</span> : <span className="badge-danger">Inactivo</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedUser(u); setNewPassword(''); setConfirmPassword(''); setPasswordModalOpen(true); }}
                            className="btn-ghost btn-sm p-1.5 text-surface-600" title="Cambiar contraseña">
                            <KeyRound size={15} />
                          </button>
                          <button onClick={() => { setSelectedUser(u); setVincularAseguradoId(u.aseguradoId || ''); setVincularModalOpen(true); }}
                            className="btn-ghost btn-sm p-1.5 text-brand-600" title="Vincular asegurado"
                            disabled={u.username === user?.username}>
                            <Link2 size={15} />
                          </button>
                          <button onClick={() => { setSelectedUser(u); setNewRol(u.rol); setRolModalOpen(true); }}
                            className="btn-ghost btn-sm p-1.5" title="Cambiar rol"
                            disabled={u.username === user?.username}>
                            <ShieldAlert size={15} />
                          </button>
                          <button onClick={() => handleToggleActivo(u)}
                            className={`btn-ghost btn-sm p-1.5 ${u.activo ? 'text-warning' : 'text-success'}`}
                            title={u.activo ? 'Desactivar' : 'Activar'}
                            disabled={u.username === user?.username}>
                            {u.activo ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
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

      {/* Create User Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Usuario" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="label">Username</label>
            <input value={form.username} onChange={e => updateForm('username', e.target.value)}
              className="input-field" placeholder="ej: agente_carlos" required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" value={form.password} onChange={e => updateForm('password', e.target.value)}
              className="input-field" placeholder="Mínimo 6 caracteres" required />
          </div>
          <div>
            <label className="label">Nombre Completo</label>
            <input value={form.nombreCompleto} onChange={e => updateForm('nombreCompleto', e.target.value)}
              className="input-field" placeholder="ej: Carlos López García" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
              className="input-field" placeholder="ej: carlos@empresa.com" required />
          </div>
          <div>
            <label className="label">Rol</label>
            <select value={form.rol} onChange={e => updateForm('rol', e.target.value)} className="input-field">
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label} — {r.value}</option>
              ))}
            </select>
            <p className="text-xs text-surface-400 mt-1.5">
              {form.rol === 'ROLE_ADMIN' && '⚠️ Acceso total al sistema'}
              {form.rol === 'ROLE_AGENT' && 'Puede crear asegurados y pólizas'}
              {form.rol === 'ROLE_EVALUATOR' && 'Puede evaluar siniestros'}
              {form.rol === 'ROLE_FINANCE' && 'Gestiona primas y pagos'}
              {form.rol === 'ROLE_CUSTOMER' && 'Solo ve sus propias pólizas — requiere vincular asegurado'}
            </p>
          </div>
          {form.rol === 'ROLE_CUSTOMER' && (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
              <label className="label text-brand-800">ID del Asegurado a vincular</label>
              <input type="number" value={form.aseguradoId || ''}
                onChange={e => updateForm('aseguradoId', e.target.value ? Number(e.target.value) : null)}
                className="input-field" placeholder="Ingresa el ID del asegurado" required />
              <p className="text-xs text-brand-600 mt-1.5">
                El asegurado debe existir previamente. Puedes crearlo en la sección "Asegurados".
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleCrear} disabled={saving} className="btn-primary">
            {saving ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </Modal>

      {/* Change Role Modal */}
      <Modal open={rolModalOpen} onClose={() => setRolModalOpen(false)} title="Cambiar Rol" maxWidth="max-w-sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-sm"><span className="text-surface-500">Usuario:</span> <span className="font-medium ml-1">{selectedUser.username}</span></p>
              <p className="text-sm mt-1"><span className="text-surface-500">Rol actual:</span> <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRolColor(selectedUser.rol)}`}>{getRolLabel(selectedUser.rol)}</span></p>
            </div>
            <div>
              <label className="label">Nuevo Rol</label>
              <select value={newRol} onChange={e => setNewRol(e.target.value)} className="input-field">
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setRolModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleCambiarRol} className="btn-primary">Cambiar Rol</button>
        </div>
      </Modal>

      {/* Vincular Asegurado Modal */}
      <Modal open={vincularModalOpen} onClose={() => setVincularModalOpen(false)} title="Vincular Asegurado" maxWidth="max-w-sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-sm"><span className="text-surface-500">Usuario:</span> <span className="font-medium ml-1">{selectedUser.username}</span></p>
              {selectedUser.aseguradoNombre && (
                <p className="text-sm mt-1"><span className="text-surface-500">Vinculado a:</span> <span className="font-medium ml-1">{selectedUser.aseguradoNombre}</span></p>
              )}
            </div>
            <div>
              <label className="label">ID del Asegurado</label>
              <input type="number" value={vincularAseguradoId}
                onChange={e => setVincularAseguradoId(e.target.value ? Number(e.target.value) : '')}
                className="input-field" placeholder="Ingresa el ID del asegurado" />
              <p className="text-xs text-surface-400 mt-1.5">
                El asegurado debe existir. Verifica el ID en la sección "Asegurados".
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setVincularModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleVincularAsegurado} className="btn-primary" disabled={!vincularAseguradoId}>Vincular</button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Cambiar Contraseña" maxWidth="max-w-sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-50 rounded-lg">
              <p className="text-sm"><span className="text-surface-500">Usuario:</span> <span className="font-medium ml-1">{selectedUser.username}</span></p>
            </div>
            <div>
              <label className="label">Nueva Contraseña</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="input-field" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="label">Confirmar Contraseña</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="input-field" placeholder="Repite la contraseña" />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-danger mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-200">
          <button onClick={() => setPasswordModalOpen(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleCambiarPassword} className="btn-primary"
            disabled={!newPassword || newPassword.length < 6 || newPassword !== confirmPassword}>
            Cambiar Contraseña
          </button>
        </div>
      </Modal>
    </div>
  );
}