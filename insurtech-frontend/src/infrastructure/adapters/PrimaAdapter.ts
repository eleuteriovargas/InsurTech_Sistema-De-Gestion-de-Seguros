import httpClient from '../api/httpClient';
import type { ApiResponse, PageResponse } from '../../domain/interfaces';
import type { Prima } from '../../domain/entities';

export interface PagoData {
  monto: number;
  metodoPago: string;
  referencia?: string;
  numeroAutorizacion?: string;
}

export interface PrimaConDetalle extends Prima {
  aseguradoNombre?: string;
}

export class PrimaAdapter {
  async generarCuotas(polizaId: number, numeroCuotas: number): Promise<Prima[]> {
    const res = await httpClient.post<ApiResponse<Prima[]>>(
      `/primas/generar/${polizaId}`,
      null,
      { params: { numeroCuotas } }
    );
    return res.data.data;
  }

  async listarPorPoliza(polizaId: number, page = 0, size = 20): Promise<PageResponse<Prima>> {
    const res = await httpClient.get<ApiResponse<PageResponse<Prima>>>(`/primas/poliza/${polizaId}`, {
      params: { page, size },
    });
    return res.data.data;
  }

  async pendientesPorAsegurado(aseguradoId: number): Promise<Prima[]> {
    const res = await httpClient.get<ApiResponse<Prima[]>>(`/primas/pendientes/asegurado/${aseguradoId}`);
    return res.data.data;
  }

  async registrarPago(primaId: number, pago: PagoData): Promise<Prima> {
    const res = await httpClient.post<ApiResponse<Prima>>(`/primas/${primaId}/pagar`, pago);
    return res.data.data;
  }
}

export const primaAdapter = new PrimaAdapter();
