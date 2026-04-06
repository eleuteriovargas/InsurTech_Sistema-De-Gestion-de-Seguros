import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAdapter } from '../../../infrastructure/adapters/AuthAdapter';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAdapter.login({ username, password });
      login({
        username: response.username,
        rol: response.rol,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        aseguradoId: response.aseguradoId,
      });
      toast.success('Bienvenido, ' + response.username);
      navigate(response.rol === 'ROLE_CUSTOMER' ? '/portal' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-500/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-600 mb-8 shadow-lg shadow-brand-600/30">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">InsurTech</h1>
          <p className="text-surface-400 text-lg leading-relaxed max-w-sm mx-auto">
            Sistema integral de gestión de seguros con arquitectura empresarial
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-surface-500">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-xs uppercase tracking-wider mt-1">Roles</p>
            </div>
            <div className="w-px h-10 bg-surface-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">JWT</p>
              <p className="text-xs uppercase tracking-wider mt-1">Seguridad</p>
            </div>
            <div className="w-px h-10 bg-surface-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">REST</p>
              <p className="text-xs uppercase tracking-wider mt-1">API</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">InsurTech</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 mb-1">Iniciar sesión</h2>
          <p className="text-surface-500 mb-8">Ingresa tus credenciales para acceder</p>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-danger/5 border border-danger/20 rounded-xl animate-fade-in">
              <AlertCircle size={16} className="text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="input-field" placeholder="admin" required autoFocus />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full btn-lg mt-2">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}