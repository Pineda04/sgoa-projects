# solver_logic.py (Versión 6.2)
from ortools.sat.python import cp_model
from schemas import PlanificacionInput, Aula
import collections

def aplicar_reglas_del_negocio(model: cp_model.CpModel, datos_entrada: PlanificacionInput, asignaciones: dict):
    
    aulas_con_opcion_sin_aula = datos_entrada.aulas + [Aula(id="SIN_AULA", tipo="NINGUNO", capacidad=999)]
    
    # --- 1. Preprocesamiento de Horarios ---
    horas_disponibles = sorted(list({s.id.split('_')[1] for s in datos_entrada.franjas_horarias}))
    
    def obtener_patron_dias(uv):
        dias = ["LUN", "MAR", "MIE", "JUE", "VIE"]
        if uv > 5 or uv < 1: return []
        return dias[:uv]

    # --- 2. Variables de Decisión de Alto Nivel ---
    decision_vars = {}
    for c in datos_entrada.secciones:
        dias_requeridos = obtener_patron_dias(c.unidades_valorativas)
        if not dias_requeridos: continue

        for d in datos_entrada.docentes:
            for a in aulas_con_opcion_sin_aula:
                for h in horas_disponibles:
                    patron_es_valido = all(any(s.id == f"{dia}_{h}" for s in datos_entrada.franjas_horarias) for dia in dias_requeridos)
                    if patron_es_valido:
                        var_name = f"decision_{c.id}_{d.id}_{a.id}_{h}"
                        decision_vars[(c.id, d.id, a.id, h)] = model.NewBoolVar(var_name)

    # --- 3. VINCULACIÓN Y REGLAS ---

    # Vínculo: Si se elige una variable de decisión, se encienden los slots correspondientes.
    for (c_id, d_id, a_id, h), var in decision_vars.items():
        uv = next(c.unidades_valorativas for c in datos_entrada.secciones if c.id == c_id)
        dias_requeridos = obtener_patron_dias(uv)
        for dia in dias_requeridos:
            slot_id = f"{dia}_{h}"
            model.Add(asignaciones[(d_id, c_id, a_id, slot_id)] == 1).OnlyEnforceIf(var)

    # REGLA 1: Cada clase se asigna como máximo a UN patrón.
    for c in datos_entrada.secciones:
        model.AddAtMostOne(decision_vars.get((c.id, d.id, a.id, h)) for d in datos_entrada.docentes for a in aulas_con_opcion_sin_aula for h in horas_disponibles if (c.id, d.id, a.id, h) in decision_vars)

    # --- Creación de Variables Auxiliares ---
    seccion_esta_asignada_vars = {c.id: model.NewBoolVar(f"seccion_{c.id}_asignada") for c in datos_entrada.secciones}
    docente_imparte_clase_vars = {(d.id, c.id): model.NewBoolVar(f"docente_{d.id}_imparte_{c.id}") for d in datos_entrada.docentes for c in datos_entrada.secciones}

    for c in datos_entrada.secciones:
        decisiones_para_clase = [var for (c_id, d_id, a_id, h), var in decision_vars.items() if c_id == c.id]
        model.AddBoolOr(decisiones_para_clase).OnlyEnforceIf(seccion_esta_asignada_vars[c.id])
        model.Add(sum(decisiones_para_clase) == 0).OnlyEnforceIf(seccion_esta_asignada_vars[c.id].Not())

    for d in datos_entrada.docentes:
        for c in datos_entrada.secciones:
            decisiones_para_docente_clase = [var for (c_id, d_id, a_id, h), var in decision_vars.items() if c_id == c.id and d_id == d.id]
            model.AddBoolOr(decisiones_para_docente_clase).OnlyEnforceIf(docente_imparte_clase_vars[(d.id, c.id)])
            model.Add(sum(decisiones_para_docente_clase) == 0).OnlyEnforceIf(docente_imparte_clase_vars[(d.id, c.id)].Not())
            
    # --- Reglas Sagradas ---
    # Anti-colisión de Docentes.
    for s in datos_entrada.franjas_horarias:
        for d in datos_entrada.docentes:
            model.AddAtMostOne(asignaciones[(d.id, c.id, a.id, s.id)] for c in datos_entrada.secciones for a in aulas_con_opcion_sin_aula)

    # Anti-colisión de Aulas Reales.
    for s in datos_entrada.franjas_horarias:
        for a in datos_entrada.aulas:
            model.AddAtMostOne(asignaciones[(d.id, c.id, a.id, s.id)] for d in datos_entrada.docentes for c in datos_entrada.secciones)
            
    # Carga Máxima de UV por Docente.
    for d in datos_entrada.docentes:
        carga_total_uv = sum(c.unidades_valorativas * docente_imparte_clase_vars.get((d.id, c.id)) for c in datos_entrada.secciones)
        model.Add(carga_total_uv <= d.carga_maxima_uv)

    # Disponibilidad del Docente.
    for (c_id, d_id, a_id, h), var in decision_vars.items():
        uv = next(c.unidades_valorativas for c in datos_entrada.secciones if c.id == c_id)
        dias_requeridos = obtener_patron_dias(uv)
        docente = next(d for d in datos_entrada.docentes if d.id == d_id)
        for dia in dias_requeridos:
            slot_id = f"{dia}_{h}"
            if slot_id not in docente.horario_disponible:
                model.Add(var == 0)
                break
                
    # --- 4. REGLAS SUAVES (CON PENALIZACIONES) ---
    total_penalties = []
    
    # PENALIZACIÓN 1: No asignar una clase (MUY ALTA)
    for c in datos_entrada.secciones:
        total_penalties.append(1000 * seccion_esta_asignada_vars[c.id].Not())

    # ¡NUEVA! PENALIZACIÓN: Dejar a un docente sin clases (ALTA)
    for d in datos_entrada.docentes:
        clases_impartidas_por_docente = [docente_imparte_clase_vars.get((d.id, c.id)) for c in datos_entrada.secciones]
        docente_esta_inactivo = model.NewBoolVar(f"docente_inactivo_{d.id}")
        # Si la suma de clases que imparte es 0, entonces está inactivo.
        model.Add(sum(clases_impartidas_por_docente) == 0).OnlyEnforceIf(docente_esta_inactivo)
        # Penalización alta para desincentivar esto.
        total_penalties.append(500 * docente_esta_inactivo)

    # PENALIZACIÓN: Asignar sin aula (BAJA)
    for c in datos_entrada.secciones:
        decisiones_sin_aula = [var for (c_id, d_id, a_id, h), var in decision_vars.items() if c_id == c.id and a_id == "SIN_AULA"]
        if decisiones_sin_aula:
            clase_asignada_sin_aula = model.NewBoolVar(f"clase_{c.id}_sin_aula")
            model.AddBoolOr(decisiones_sin_aula).OnlyEnforceIf(clase_asignada_sin_aula)
            total_penalties.append(10 * clase_asignada_sin_aula)

    # PENALIZACIÓN: Violar requisito de laboratorio (ALTA)
    for c in datos_entrada.secciones:
        if c.requiere_lab:
            for a in datos_entrada.aulas:
                if a.tipo.upper() != 'LABORATORIO':
                    decisiones_en_aula_incompatible = [var for (c_id, d_id, a_id, h), var in decision_vars.items() if c_id == c.id and a_id == a.id]
                    if decisiones_en_aula_incompatible:
                        violacion_lab = model.NewBoolVar(f"violacion_lab_{c.id}_{a.id}")
                        model.AddBoolOr(decisiones_en_aula_incompatible).OnlyEnforceIf(violacion_lab)
                        total_penalties.append(100 * violacion_lab)

    # PENALIZACIÓN: Violar capacidad de aula (MEDIA)
    for c in datos_entrada.secciones:
        for a in datos_entrada.aulas:
            if c.alumnos_matriculados > a.capacidad:
                decisiones_en_aula_pequena = [var for (c_id, d_id, a_id, h), var in decision_vars.items() if c_id == c.id and a_id == a.id]
                if decisiones_en_aula_pequena:
                    violacion_cap = model.NewBoolVar(f"violacion_cap_{c.id}_{a.id}")
                    model.AddBoolOr(decisiones_en_aula_pequena).OnlyEnforceIf(violacion_cap)
                    sobrecupo = c.alumnos_matriculados - a.capacidad
                    total_penalties.append(10 * sobrecupo * violacion_cap)
    
    # PENALIZACIÓN: No cumplir preferencia (BAJA)
    for d in datos_entrada.docentes:
        for c in datos_entrada.secciones:
            if c.id_asignatura not in d.preferencias:
                docente_imparte_clase = docente_imparte_clase_vars.get((d.id, c.id))
                total_penalties.append(20 * docente_imparte_clase)

    # --- 5. OBJETIVO FINAL ---
    model.Minimize(sum(total_penalties))