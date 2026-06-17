---
name: Nueva Tarea
about: Plantilla estándar para el desarrollo de nuevas tareas, definición de objetivos y reglas de Git.
title: '[TASK] '
labels: triage
assignees: ''
---

## **Descripción**
...

## **Archivos Clave**
- 
- 

## **Objetivos**
- [ ]
- [ ]

## **Ramas**
El nombre de las ramas debe cumplir con la siguiente estructura `autor/prefijo/nombreTarea`, ej:  
```bash
git checkout -b anthony/feat/endpointsPeriodosAcademicos
```  

## **Commits**
El formato de los commits debe cumplir con la siguiente estructura `prefijo: descripción de los cambios`, ej:
```bash
git commit -m "feat: agregar endpoints para el manejo de periodos académicos"
```

## **Prefijos**
Para la creación de commits y ramas, se deben utilizar cualquiera de los siguientes prefijos:
- ` feat `: Nueva funcionalidad
- ` fix `: Corrección de bugs/errores
- ` refactor `: Cambios en la estructura del código sin afectar la funcionalidad
- ` docs `: Cambios en la documentación
- ` test `: Agregación de tests
- ` chore `: Tareas de mantenimiento
- ` merge `: Fusion de ramas
