import httpClient from '../api/httpClient';
import type {
  IAseguradoRepository, AseguradoFormData, PageParams,
  PageResponse, ApiResponse,
} from '../../domain/interfaces';
import type { Asegurado } from '../../domain/entities';
import { EstadoAsegurado } from '../../domain/enums';

export class AseguradoAdapter implements IAseguradoRepository {
  async crear(data: AseguradoFormData): Promise<Asegurado> {
    const res = await httpClient.post<ApiResponse<Asegurado>>('/asegurados', data);
    return res.data.data;
  }

  async obtenerPorId(id: number): Promise<Asegurado> {
    const res = await httpClient.get<ApiResponse<Asegurado>>(`/asegurados/${id}`);
    return res.data.data;
  }

  async listar(params: PageParams): Promise<PageResponse<Asegurado>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Asegurado>>>('/asegurados', {
      params: { page: params.page, size: params.size, sortBy: params.sortBy, sortDir: params.sortDir },
    });
    return res.data.data;
  }

  async buscarPorNombre(nombre: string, params: PageParams): Promise<PageResponse<Asegurado>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Asegurado>>>('/asegurados/buscar', {
      params: { nombre, page: params.page, size: params.size },
    });
    return res.data.data;
  }

  async actualizar(id: number, data: AseguradoFormData): Promise<Asegurado> {
    const res = await httpClient.put<ApiResponse<Asegurado>>(`/asegurados/${id}`, data);
    return res.data.data;
  }

  async cambiarEstado(id: number, estado: EstadoAsegurado): Promise<Asegurado> {
    const res = await httpClient.patch<ApiResponse<Asegurado>>(`/asegurados/${id}/estado`, null, {
      params: { estado },
    });
    return res.data.data;
  }

  async eliminar(id: number): Promise<void> {
    await httpClient.delete(`/asegurados/${id}`);
  }
}

export const aseguradoAdapter = new AseguradoAdapter();
