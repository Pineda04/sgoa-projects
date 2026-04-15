# schemas.py
from pydantic import BaseModel
from typing import List, Optional

# --- Modelos de ENTRADA ---
class Docente(BaseModel):
    id: str
    nombre: str
    tipo_contrato: str
    carga_maxima_uv: int
    horario_disponible: List[str]
    preferencias: List[str]

class Seccion(BaseModel):
    id: str
    id_asignatura: str
    unidades_valorativas: int
    requiere_lab: bool
    alumnos_matriculados: int
    nombre_asignatura: str 
    codigo_asignatura: str

class Aula(BaseModel):
    id: str
    tipo: str
    capacidad: int

class FranjaHoraria(BaseModel):
    id: str
    descripcion: str

class PlanificacionInput(BaseModel):
    docentes: List[Docente]
    secciones: List[Seccion]
    aulas: List[Aula]
    franjas_horarias: List[FranjaHoraria]

# --- Modelos de SALIDA ---
class FranjaHorariaOutput(BaseModel):
    id: str
    descripcion: str

class AsignacionOutput(BaseModel):
    docente_id: str
    docente_nombre: str
    codigo_asignatura: str
    nombre_asignatura: str
    unidades_valorativas: int
    seccion: str
    # CORRECCIÓN CLAVE: El aula ahora es opcional.
    aula_asignada: Optional[str] = None
    franjas_horarias: List[FranjaHorariaOutput]

class ClaseNoAsignada(BaseModel):
    id_seccion: str
    nombre_asignatura: str
    motivo: str

class Advertencia(BaseModel):
    id_seccion: str
    nombre_asignatura: str
    advertencia: str

class PlanificacionOutput(BaseModel):
    planificacion: List[AsignacionOutput]
    clases_no_asignadas: List[ClaseNoAsignada]
    advertencias: List[Advertencia]