import httpClient from '../api/httpClient';
import type { ApiResponse, PageResponse } from '../../domain/interfaces';
import type { Asegurado, Poliza, Siniestro } from '../../domain/entities';

export interface DashboardStats {
  totalAsegurados: number;
  totalPolizas: number;
  polizasVigentes: number;
  totalSiniestros: number;
  siniestrosPendientes: number;
}

export class DashboardAdapter {
  async getStats(): Promise<DashboardStats> {
    const [asegurados, polizas, siniestros] = await Promise.all([
      httpClient.get<ApiResponse<PageResponse<Asegurado>>>('/asegurados', { params: { page: 0, size: 1 } }),
      httpClient.get<ApiResponse<PageResponse<Poliza>>>('/polizas', { params: { page: 0, size: 1 } }),
      httpClient.get<ApiResponse<PageResponse<Siniestro>>>('/siniestros', { params: { page: 0, size: 1 } }),
    ]);

    let polizasVigentes = 0;
    let siniestrosPendientes = 0;
    try {
      const vigRes = await httpClient.get<ApiResponse<PageResponse<Poliza>>>('/polizas/estado/VIGENTE', { params: { page: 0, size: 1 } });
      polizasVigentes = vigRes.data.data.totalElements;
    } catch { /* ignore */ }
    try {
      const sinRes = await httpClient.get<ApiResponse<PageResponse<Siniestro>>>('/siniestros/estado/REPORTADO', { params: { page: 0, size: 1 } });
      siniestrosPendientes = sinRes.data.data.totalElements;
    } catch { /* ignore */ }

    return {
      totalAsegurados: asegurados.data.data.totalElements,
      totalPolizas: polizas.data.data.totalElements,
      polizasVigentes,
      totalSiniestros: siniestros.data.data.totalElements,
      siniestrosPendientes,
    };
  }
}

export const dashboardAdapter = new DashboardAdapter();
