export enum TipoAsegurado {
  PERSONA_NATURAL = 'PERSONA_NATURAL',
  PERSONA_JURIDICA = 'PERSONA_JURIDICA',
}

export enum EstadoAsegurado {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  CANCELADO = 'CANCELADO',
}

export enum NivelRiesgo {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export enum TipoPoliza {
  AUTO = 'AUTO',
  HOGAR = 'HOGAR',
  SALUD = 'SALUD',
  VIDA = 'VIDA',
}

export enum EstadoPoliza {
  VIGENTE = 'VIGENTE',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
  SUSPENDIDA = 'SUSPENDIDA',
}

export enum EstadoSiniestro {
  REPORTADO = 'REPORTADO',
  EVALUACION = 'EVALUACION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  PAGADO = 'PAGADO',
}

export enum EstadoPrima {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  MOROSO = 'MOROSO',
}

export enum MetodoPago {
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  EFECTIVO = 'EFECTIVO',
  AUTOMATICO = 'AUTOMATICO',
}