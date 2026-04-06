import httpClient from '../api/httpClient';
import type {
  ISiniestroRepository, SiniestroFormData, PageParams,
  PageResponse, ApiResponse,
} from '../../domain/interfaces';
import type { Siniestro } from '../../domain/entities';
import { EstadoSiniestro } from '../../domain/enums';

export class SiniestroAdapter implements ISiniestroRepository {
  async reportar(data: SiniestroFormData): Promise<Siniestro> {
    const res = await httpClient.post<ApiResponse<Siniestro>>('/siniestros', data);
    return res.data.data;
  }

  async obtenerPorId(id: number): Promise<Siniestro> {
    const res = await httpClient.get<ApiResponse<Siniestro>>(`/siniestros/${id}`);
    return res.data.data;
  }

  async listar(params: PageParams): Promise<PageResponse<Siniestro>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Siniestro>>>('/siniestros', {
      params: { page: params.page, size: params.size },
    });
    return res.data.data;
  }

  async listarPorPoliza(polizaId: number, params: PageParams): Promise<PageResponse<Siniestro>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Siniestro>>>(`/siniestros/poliza/${polizaId}`, {
      params: { page: params.page, size: params.size },
    });
    return res.data.data;
  }

  async evaluar(id: number, estado: EstadoSiniestro, motivo?: string, montoAprobado?: number): Promise<Siniestro> {
    const res = await httpClient.patch<ApiResponse<Siniestro>>(`/siniestros/${id}/evaluar`, null, {
      params: { estado, motivo, montoAprobado },
    });
    return res.data.data;
  }

  async eliminar(id: number): Promise<void> {
    await httpClient.delete(`/siniestros/${id}`);
  }
}

export const siniestroAdapter = new SiniestroAdapter();
