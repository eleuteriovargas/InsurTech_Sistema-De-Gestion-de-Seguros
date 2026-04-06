import httpClient from '../api/httpClient';
import type {
  IPolizaRepository, PolizaFormData, PageParams,
  PageResponse, ApiResponse,
} from '../../domain/interfaces';
import type { Poliza } from '../../domain/entities';
import { EstadoPoliza } from '../../domain/enums';

export class PolizaAdapter implements IPolizaRepository {
  async crear(data: PolizaFormData): Promise<Poliza> {
    const res = await httpClient.post<ApiResponse<Poliza>>('/polizas', data);
    return res.data.data;
  }

  async obtenerPorId(id: number): Promise<Poliza> {
    const res = await httpClient.get<ApiResponse<Poliza>>(`/polizas/${id}`);
    return res.data.data;
  }

  async listar(params: PageParams): Promise<PageResponse<Poliza>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Poliza>>>('/polizas', {
      params: { page: params.page, size: params.size, sortBy: params.sortBy, sortDir: params.sortDir },
    });
    return res.data.data;
  }

  async listarPorAsegurado(aseguradoId: number, params: PageParams): Promise<PageResponse<Poliza>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Poliza>>>(`/polizas/asegurado/${aseguradoId}`, {
      params: { page: params.page, size: params.size },
    });
    return res.data.data;
  }

  async listarPorEstado(estado: EstadoPoliza, params: PageParams): Promise<PageResponse<Poliza>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Poliza>>>(`/polizas/estado/${estado}`, {
      params: { page: params.page, size: params.size },
    });
    return res.data.data;
  }

  async renovar(id: number): Promise<Poliza> {
    const res = await httpClient.patch<ApiResponse<Poliza>>(`/polizas/${id}/renovar`);
    return res.data.data;
  }

  async cancelar(id: number): Promise<Poliza> {
    const res = await httpClient.patch<ApiResponse<Poliza>>(`/polizas/${id}/cancelar`);
    return res.data.data;
  }

  async eliminar(id: number): Promise<void> {
    await httpClient.delete(`/polizas/${id}`);
  }
}

export const polizaAdapter = new PolizaAdapter();
