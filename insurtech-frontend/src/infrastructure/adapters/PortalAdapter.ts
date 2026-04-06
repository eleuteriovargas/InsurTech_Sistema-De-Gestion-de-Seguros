import httpClient from '../api/httpClient';
import type { ApiResponse, PageResponse } from '../../domain/interfaces';
import type { Poliza, Siniestro, Prima, Asegurado } from '../../domain/entities';
import type { SiniestroFormData } from '../../domain/interfaces';

export interface ClienteResumen {
  aseguradoId: number;
  nombreCompleto: string;
  email: string;
  estado: string;
  nivelRiesgo: string;
  totalPolizas: number;
  polizasVigentes: number;
  totalSiniestros: number;
  primasPendientes: number;
  montoTotalPendiente: number;
}

export class PortalAdapter {
  async getResumen(): Promise<ClienteResumen> {
    const res = await httpClient.get<ApiResponse<ClienteResumen>>('/portal/resumen');
    return res.data.data;
  }

  async getMiPerfil(): Promise<Asegurado> {
    const res = await httpClient.get<ApiResponse<Asegurado>>('/portal/mi-perfil');
    return res.data.data;
  }

  async getMisPolizas(page = 0, size = 20): Promise<PageResponse<Poliza>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Poliza>>>('/portal/mis-polizas', {
      params: { page, size },
    });
    return res.data.data;
  }

  async getMisSiniestros(): Promise<Siniestro[]> {
    const res = await httpClient.get<ApiResponse<Siniestro[]>>('/portal/mis-siniestros');
    return res.data.data;
  }

  async reportarSiniestro(data: SiniestroFormData): Promise<Siniestro> {
    const res = await httpClient.post<ApiResponse<Siniestro>>('/portal/mis-siniestros', data);
    return res.data.data;
  }

  async getMisPrimas(): Promise<Prima[]> {
    const res = await httpClient.get<ApiResponse<Prima[]>>('/portal/mis-primas');
    return res.data.data;
  }
}

export const portalAdapter = new PortalAdapter();