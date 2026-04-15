# SGOA - Sistema de Gestión y Organización Académica

API de planificación académica basada en inteligencia artificial que utiliza Google OR-Tools para generar horarios óptimos para instituciones educativas.

## Descripción

SGOA es un microservicio REST desarrollado con FastAPI que resuelve el problema de la planificación académica mediante programación de restricciones (CP - Constraint Programming). El sistema recibe como entrada información sobre docentes, secciones, aulas y franjas horarias, y genera una asignación óptima que cumple con todas las reglas del negocio.

### Características

- **Optimización inteligente**: Utiliza Google OR-Tools para encontrar la mejor asignación posible
- **Reglas de negocio configurables**: Soporta restricciones duras y suaves con penalizaciones
- **Diagnóstico detallado**: Proporciona información sobre clases no asignadas y advertencias
- **Documentación interactiva**: Swagger UI integrado

## Tecnologías

- **FastAPI** - Framework web moderno de alto rendimiento
- **Google OR-Tools** - Solver de programación de restricciones
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

## Requisitos

```txt
ortools==9.14.6206
fastapi==0.116.1
uvicorn==0.35.0
pydantic==2.11.7
```

## Ejecución

1. Crear y activar el entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
.\venv\Scripts\Activate  # Windows
```

2. Instalar las dependencias:

```bash
pip install -r requirements.txt
```

3. Ejecutar el servidor:

```bash
uvicorn main:app --reload
```

4. Acceder a la documentación interactiva en: `http://localhost:8000/docs`

## Uso de la API

### Endpoint principal

`POST /planificar`

Recibe un objeto `PlanificacionInput` y devuelve un `PlanificacionOutput` con:

- `planificacion`: Lista de asignaciones realizadas
- `clases_no_asignadas`: Clases que no pudieron ser programadas
- `advertencias`: Avisos sobre asignaciones especiales

### Ejemplo de petición

```json
{
  "docentes": [...],
  "secciones": [...],
  "aulas": [...],
  "franjas_horarias": [...]
}
```

Los datos de prueba en `test_data.json` contienen un ejemplo completo de entrada.

## Reglas implementadas

### Restricciones duras

- Cada clase se asigna a un máximo de un patrón (docente/aula/hora)
- Un docente no puede dar dos clases al mismo tiempo
- Un aula no puede usarse por dos clases al mismo tiempo
- La carga académica del docente no excede su máximo de UV

### Restricciones suaves (con penalización)

- Asignar una clase sin aula
- Violar requisito de laboratorio
- Exceder capacidad del aula
- Ignorar preferencias del docente

## Créditos

Desarrollado por **Fredy Vasquez** como proyecto de la clase de **Tópicos Especiales y Avanzados** - II PAC 2025
