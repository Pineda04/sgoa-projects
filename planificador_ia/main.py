# main.py
from fastapi import FastAPI, HTTPException
from ortools.sat.python import cp_model
from schemas import *
from solver_logic import aplicar_reglas_del_negocio
import collections

app = FastAPI(
    title="API de Planificación Académica con IA",
    description="Microservicio que utiliza Google OR-Tools para generar horarios óptimos."
)

@app.get("/")
def read_root():
    """
    Endpoint raíz que muestra un mensaje de bienvenida.
    """
    return {"message": "Bienvenido a la API de Planificación. Vaya a /docs para la documentación interactiva."}


@app.post("/planificar", response_model=PlanificacionOutput)
def planificar(datos_entrada: PlanificacionInput):
    """
    Este endpoint recibe los datos de planificación y devuelve una propuesta óptima.
    """
    
    model = cp_model.CpModel()

    # Creación de variables, incluyendo la pseudo-aula "SIN_AULA"
    aulas_con_opcion_sin_aula = datos_entrada.aulas + [Aula(id="SIN_AULA", tipo="NINGUNO", capacidad=999)]
    asignaciones = {}
    for d in datos_entrada.docentes:
        for c in datos_entrada.secciones:
            for a in aulas_con_opcion_sin_aula:
                for s in datos_entrada.franjas_horarias:
                    var_name = f"asig_{d.id}_{c.id}_{a.id}_{s.id}"
                    asignaciones[(d.id, c.id, a.id, s.id)] = model.NewBoolVar(var_name)
    
    # Llamamos a nuestro cerebro para que aplique todas las reglas
    aplicar_reglas_del_negocio(model, datos_entrada, asignaciones)
    
    # --- LLAMADA AL SOLVER Y PROCESAMIENTO DE SALIDA ---
    solver = cp_model.CpSolver()
    
    # --- CAMBIO IMPORTANTE AQUÍ ---
    # Aumentar el tiempo de búsqueda a 180 segundos (3 minutos)
    solver.parameters.max_time_in_seconds = 180.0
    
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        lista_asignaciones = []
        clases_no_asignadas_out = []
        advertencias_out = []
        
        secciones_map = {c.id: c for c in datos_entrada.secciones}
        franjas_map = {f.id: f for f in datos_entrada.franjas_horarias}
        
        clases_asignadas_ids = set()

        # Primero, identificamos qué clases SÍ fueron asignadas
        for (d_id, c_id, a_id, s_id), var in asignaciones.items():
            if solver.Value(var) == 1:
                clases_asignadas_ids.add(c_id)

        # Ahora, procesamos cada clase asignada para construir la salida
        for c_id in clases_asignadas_ids:
            seccion_obj = secciones_map[c_id]
            docente_asignado = None
            aula_asignada = None
            slots_asignados = []

            # Buscamos todas las partes de la asignación para esta clase
            for (d_id_inner, c_id_inner, a_id_inner, s_id_inner), var in asignaciones.items():
                if c_id_inner == c_id and solver.Value(var) == 1:
                    docente_asignado = d_id_inner
                    aula_asignada = a_id_inner
                    slots_asignados.append(s_id_inner)
            
            docente_obj = next((d for d in datos_entrada.docentes if d.id == docente_asignado), None)
            
            aula_final = aula_asignada
            if aula_final == "SIN_AULA":
                aula_final = None
                advertencias_out.append(Advertencia(
                    id_seccion=c_id,
                    nombre_asignatura=seccion_obj.nombre_asignatura,
                    advertencia="ADVERTENCIA: No se encontró un aula compatible disponible. La clase fue asignada sin aula."
                ))
            
            asignacion = AsignacionOutput(
                docente_id=docente_obj.id,
                docente_nombre=docente_obj.nombre,
                codigo_asignatura=seccion_obj.codigo_asignatura,
                nombre_asignatura=seccion_obj.nombre_asignatura,
                unidades_valorativas=seccion_obj.unidades_valorativas,
                seccion=seccion_obj.id,
                aula_asignada=aula_final,
                franjas_horarias=[FranjaHorariaOutput(**franjas_map[s_id].dict()) for s_id in sorted(slots_asignados)]
            )
            lista_asignaciones.append(asignacion)
            
        # PROCESAR CLASES NO ASIGNADAS CON DIAGNÓSTICO DETALLADO
        for c in datos_entrada.secciones:
            if c.id not in clases_asignadas_ids:
                motivos = []
                uv_requeridas = c.unidades_valorativas
                
                docentes_potenciales = []
                for d in datos_entrada.docentes:
                    carga_actual = sum(a.unidades_valorativas for a in lista_asignaciones if a.docente_id == d.id)
                    if d.carga_maxima_uv - carga_actual >= uv_requeridas:
                        slots_disponibles_por_hora = collections.defaultdict(int)
                        for slot_id in d.horario_disponible:
                            hora = slot_id.split('_')[1]
                            slots_disponibles_por_hora[hora] += 1
                        
                        patrones_posibles = any(count >= uv_requeridas for count in slots_disponibles_por_hora.values())
                        if patrones_posibles:
                            docentes_potenciales.append(d.nombre)

                if not docentes_potenciales:
                    motivos.append(f"Ningún docente tiene una combinación libre de carga de UV ({uv_requeridas}) y un patrón de horario disponible de {uv_requeridas} días a la misma hora.")
                else:
                    motivos.append(f"Aunque los docentes {docentes_potenciales} tenían capacidad y horario, sus slots disponibles chocaron con otras clases de mayor prioridad.")

                clases_no_asignadas_out.append(ClaseNoAsignada(
                    id_seccion=c.id,
                    nombre_asignatura=c.nombre_asignatura,
                    motivo=" ".join(motivos)
                ))

        return PlanificacionOutput(
            planificacion=lista_asignaciones,
            clases_no_asignadas=clases_no_asignadas_out,
            advertencias=advertencias_out
        )
    else:
        raise HTTPException(status_code=500, detail="Error crítico: Las restricciones fundamentales son contradictorias.")