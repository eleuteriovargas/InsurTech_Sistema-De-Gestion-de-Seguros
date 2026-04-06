import React, { type ReactNode } from 'react';
import { X, Inbox } from 'lucide-react';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return (
    <svg className={`${s} animate-spin text-brand-600`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${maxWidth} w-full bg-white rounded-2xl shadow-modal animate-slide-up overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}
        className="btn-ghost btn-sm disabled:opacity-30">Anterior</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let page = i;
        if (totalPages > 7) {
          if (currentPage < 3) page = i;
          else if (currentPage > totalPages - 4) page = totalPages - 7 + i;
          else page = currentPage - 3 + i;
        }
        return (
          <button key={page} onClick={() => onPageChange(page)}
            className={`btn-sm rounded-lg min-w-[36px] ${page === currentPage ? 'bg-brand-600 text-white' : 'btn-ghost'}`}>
            {page + 1}
          </button>
        );
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}
        className="btn-ghost btn-sm disabled:opacity-30">Siguiente</button>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVO: 'badge-success', VIGENTE: 'badge-success', PAGADO: 'badge-success', EXITOSO: 'badge-success', APROBADO: 'badge-success',
    SUSPENDIDO: 'badge-warning', VENCIDA: 'badge-warning', VENCIDO: 'badge-warning', MOROSO: 'badge-warning', EVALUACION: 'badge-warning', REPORTADO: 'badge-info',
    CANCELADO: 'badge-danger', CANCELADA: 'badge-danger', RECHAZADO: 'badge-danger', FALLIDO: 'badge-danger', SUSPENDIDA: 'badge-warning',
    PENDIENTE: 'badge-neutral',
  };
  return <span className={map[status] || 'badge-neutral'}>{status}</span>;
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-surface-400">
      {icon || <Inbox size={48} strokeWidth={1.2} />}
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-surface-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancelar</button>
        <button onClick={onConfirm} className="btn-danger btn-sm">Confirmar</button>
      </div>
    </Modal>
  );
}
