import httpClient from '../api/httpClient';
import type { ApiResponse } from '../../domain/interfaces';

export interface UsuarioResponse {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
  aseguradoId: number | null;
  aseguradoNombre: string | null;
  createdAt: string | null;
}

export interface CreateUsuarioData {
  username: string;
  password: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  aseguradoId?: number | null;
}

export class UsuarioAdapter {
 async listar(page = 0, size = 20, rol?: string, search?: string): Promise<{
  content: UsuarioResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  const params: any = { page, size };
  if (rol) params.rol = rol;
  if (search) params.search = search;
  const res = await httpClient.get<ApiResponse<any>>('/auth/usuarios', { params });
  return res.data.data;    
  }

  async crear(data: CreateUsuarioData): Promise<UsuarioResponse> {
    const res = await httpClient.post<ApiResponse<UsuarioResponse>>('/auth/register', data);
    return res.data.data;
  }

  async cambiarEstado(id: number, activo: boolean): Promise<UsuarioResponse> {
    const res = await httpClient.patch<ApiResponse<UsuarioResponse>>(`/auth/usuarios/${id}/estado`, null, {
      params: { activo },
    });
    return res.data.data;
  }

  async cambiarRol(id: number, rol: string): Promise<UsuarioResponse> {
    const res = await httpClient.patch<ApiResponse<UsuarioResponse>>(`/auth/usuarios/${id}/rol`, null, {
      params: { rol },
    });
    return res.data.data;
  }

  async vincularAsegurado(id: number, aseguradoId: number): Promise<UsuarioResponse> {
    const res = await httpClient.patch<ApiResponse<UsuarioResponse>>(`/auth/usuarios/${id}/vincular-asegurado`, null, {
      params: { aseguradoId },
    });
    return res.data.data;
  }

  async cambiarPassword(id: number, newPassword: string): Promise<UsuarioResponse> {
  const res = await httpClient.patch<ApiResponse<UsuarioResponse>>(`/auth/usuarios/${id}/password`, {
    newPassword,
  });
  return res.data.data;
}

async cambiarMiPassword(currentPassword: string, newPassword: string): Promise<string> {
  const res = await httpClient.patch<ApiResponse<string>>('/auth/mi-password', {
    currentPassword,
    newPassword,
  });
  return res.data.data;
}
}

export const usuarioAdapter = new UsuarioAdapter();