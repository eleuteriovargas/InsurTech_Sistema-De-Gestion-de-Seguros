import { Asegurado, Poliza, Siniestro, Prima } from '../entities';
import { EstadoAsegurado, EstadoPoliza, EstadoSiniestro, TipoPoliza } from '../enums';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

export interface PageParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: string;
}

export interface AseguradoFormData {
  tipoAsegurado: string;
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
  nivelRiesgo?: string;
}

export interface PolizaFormData {
  aseguradoId: number;
  tipoPoliza: string;
  sumaAsegurada: number;
  fechaInicio: string;
  fechaFin: string;
  observaciones?: string;
  coberturaIds?: number[];
}

export interface SiniestroFormData {
  polizaId: number;
  descripcion: string;
  fechaEvento: string;
  montoSolicitado: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  rol: string;
}

export interface IAseguradoRepository {
  crear(data: AseguradoFormData): Promise<Asegurado>;
  obtenerPorId(id: number): Promise<Asegurado>;
  listar(params: PageParams): Promise<PageResponse<Asegurado>>;
  buscarPorNombre(nombre: string, params: PageParams): Promise<PageResponse<Asegurado>>;
  actualizar(id: number, data: AseguradoFormData): Promise<Asegurado>;
  cambiarEstado(id: number, estado: EstadoAsegurado): Promise<Asegurado>;
  eliminar(id: number): Promise<void>;
}

export interface IPolizaRepository {
  crear(data: PolizaFormData): Promise<Poliza>;
  obtenerPorId(id: number): Promise<Poliza>;
  listar(params: PageParams): Promise<PageResponse<Poliza>>;
  listarPorAsegurado(aseguradoId: number, params: PageParams): Promise<PageResponse<Poliza>>;
  listarPorEstado(estado: EstadoPoliza, params: PageParams): Promise<PageResponse<Poliza>>;
  renovar(id: number): Promise<Poliza>;
  cancelar(id: number): Promise<Poliza>;
  eliminar(id: number): Promise<void>;
}

export interface ISiniestroRepository {
  reportar(data: SiniestroFormData): Promise<Siniestro>;
  obtenerPorId(id: number): Promise<Siniestro>;
  listar(params: PageParams): Promise<PageResponse<Siniestro>>;
  listarPorPoliza(polizaId: number, params: PageParams): Promise<PageResponse<Siniestro>>;
  evaluar(id: number, estado: EstadoSiniestro, motivo?: string, montoAprobado?: number): Promise<Siniestro>;
  eliminar(id: number): Promise<void>;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: any): Promise<string>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  rol: string;
  aseguradoId?: number;
}