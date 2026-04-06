import {
  TipoAsegurado, EstadoAsegurado, NivelRiesgo,
  TipoPoliza, EstadoPoliza,
  EstadoSiniestro, EstadoPrima,
} from '../enums/index';

export interface Asegurado {
  id: number;
  tipoAsegurado: TipoAsegurado;
  numeroDocumento: string;
  nombre: string;
  apellido?: string;
  razonSocial?: string;
  fechaNacimiento?: string;
  email: string;
  telefono: string;
  direccionCalle?: string;
  direccionCiudad?: string;
  direccionEstado?: string;
  direccionCodigoPostal?: string;
  direccionPais?: string;
  estado: EstadoAsegurado;
  nivelRiesgo: NivelRiesgo;
  totalPolizas: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cobertura {
  id: number;
  nombre: string;
  limiteCobertura: number;
  deducible: number;
}

export interface Poliza {
  id: number;
  numeroPoliza: string;
  aseguradoId: number;
  aseguradoNombre: string;
  tipoPoliza: TipoPoliza;
  sumaAsegurada: number;
  primaBase: number;
  primaTotal: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPoliza;
  observaciones?: string;
  coberturas: Cobertura[];
  totalPrimas: number;
  totalSiniestros: number;
  createdAt: string;
  updatedAt: string;
}

export interface Siniestro {
  id: number;
  numeroSiniestro: string;
  polizaId: number;
  numeroPoliza: string;
  descripcion: string;
  fechaEvento: string;
  montoSolicitado: number;
  montoAprobado?: number;
  estado: EstadoSiniestro;
  motivoRechazo?: string;
  evaluadorId?: number;
  totalDocumentos: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prima {
  id: number;
  polizaId: number;
  numeroPoliza: string;
  numeroCuota: number;
  monto: number;
  fechaVencimiento: string;
  estado: EstadoPrima;
  diasVencida: number;
  interesMora: number;
  createdAt: string;
}

export interface Usuario {
  username: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
  aseguradoId?: number;
}