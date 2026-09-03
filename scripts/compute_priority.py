#!/usr/bin/env python3
"""Calcula el puntaje de prioridad de los examenes de una o todas las materias.

Formula documentada en CLAUDE.md (seccion "Calculo de prioridad de examenes"). Si a un examen le
falta un componente (ej. peso_final), ese componente se excluye y su peso se redistribuye
proporcionalmente entre los componentes disponibles - nunca se inventa un valor.

Uso:
    python3 scripts/compute_priority.py [course_id] [--hoy YYYY-MM-DD] [--write]

Sin course_id, procesa todas las materias en data/courses/ (excepto _ejemplo-materia).
--write actualiza el campo "prioridad" de cada examen en su exams.json.
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSES = ROOT / "data" / "courses"

PESOS = {
    "proximidad": 0.35,
    "peso_final": 0.20,
    "volumen_contenido": 0.15,
    "preparacion": 0.15,
    "densidad_examenes_cercanos": 0.10,
    "enfasis_profesor": 0.05,
}

PREP_MAP = {
    "no iniciado": 1.0,
    "en progreso": 0.5,
    "preparado": 0.1,
    "listo": 0.1,
}


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def course_ids():
    return sorted(
        d.name
        for d in COURSES.iterdir()
        if d.is_dir() and not d.name.startswith("_")
    )


def load_all_exams():
    """Devuelve lista de (course_id, examen_dict) de todas las materias, para calcular densidad."""
    todos = []
    for cid in course_ids():
        exams_path = COURSES / cid / "exams.json"
        if not exams_path.exists():
            continue
        data = load_json(exams_path)
        for ex in data.get("examenes", []):
            if ex.get("fecha"):
                todos.append((cid, ex))
    return todos


def score_proximidad(fecha_str, hoy):
    dias = (date.fromisoformat(fecha_str) - hoy).days
    if dias < 0:
        return None  # examen ya paso
    return 1 / (1 + dias / 10), dias


def score_volumen(contenidos):
    if not contenidos:
        return None
    return min(1.0, len(contenidos) / 4)


def score_preparacion(estado_preparacion):
    valor = (estado_preparacion or {}).get("valor")
    if not valor:
        return None
    return PREP_MAP.get(valor.lower())


def score_densidad(course_id, examen, todos_los_examenes, hoy):
    fecha = date.fromisoformat(examen["fecha"])
    cercanos = 0
    for cid, ex in todos_los_examenes:
        if cid == course_id and ex is examen:
            continue
        f2 = date.fromisoformat(ex["fecha"])
        if abs((f2 - fecha).days) <= 14:
            cercanos += 1
    return min(1.0, cercanos / 3), cercanos


def score_enfasis(indicaciones):
    if indicaciones is None:
        return None
    return min(1.0, len(indicaciones) / 3)


def calcular_prioridad(course_id, examen, todos_los_examenes, hoy):
    if not examen.get("fecha"):
        return None  # sin fecha, no se puede priorizar

    prox = score_proximidad(examen["fecha"], hoy)
    if prox is None:
        return None
    prox_score, dias_restantes = prox

    peso_final = examen.get("peso_final")
    peso_score = peso_final if isinstance(peso_final, (int, float)) else None

    vol_score = score_volumen(examen.get("contenidos"))
    prep_score = score_preparacion(examen.get("estado_preparacion"))
    dens_score, cercanos = score_densidad(course_id, examen, todos_los_examenes, hoy)
    enf_score = score_enfasis(examen.get("indicaciones_profesor"))

    componentes_valores = {
        "proximidad": prox_score,
        "peso_final": peso_score,
        "volumen_contenido": vol_score,
        "preparacion": prep_score,
        "densidad_examenes_cercanos": dens_score,
        "enfasis_profesor": enf_score,
    }

    disponibles = {k: v for k, v in componentes_valores.items() if v is not None}
    faltantes = [k for k, v in componentes_valores.items() if v is None]

    peso_total_disponible = sum(PESOS[k] for k in disponibles)
    if peso_total_disponible == 0:
        return None

    score = sum(v * PESOS[k] / peso_total_disponible for k, v in disponibles.items())

    return {
        "score": round(score, 3),
        "componentes": {
            "proximidad": {"valor": round(prox_score, 3), "dias_restantes": dias_restantes},
            "peso_final": {"valor": peso_score},
            "volumen_contenido": {"valor": vol_score, "cantidad_temas": len(examen.get("contenidos") or [])},
            "preparacion": {"valor": prep_score, "autoevaluacion": (examen.get("estado_preparacion") or {}).get("valor")},
            "densidad_examenes_cercanos": {"valor": round(dens_score, 3), "examenes_cercanos": cercanos},
            "enfasis_profesor": {"valor": enf_score, "cantidad_indicaciones": len(examen.get("indicaciones_profesor") or [])},
        },
        "componentes_faltantes": faltantes,
        "nivel_fuente": 4,
        "calculado_por": "scripts/compute_priority.py",
        "calculado_el": date.today().isoformat(),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("course_id", nargs="?", default=None)
    ap.add_argument("--hoy", default=None)
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    hoy = date.fromisoformat(args.hoy) if args.hoy else date.today()
    todos_los_examenes = load_all_exams()

    objetivo = [args.course_id] if args.course_id else course_ids()

    resultados = []
    for cid in objetivo:
        exams_path = COURSES / cid / "exams.json"
        if not exams_path.exists():
            continue
        data = load_json(exams_path)
        cambiado = False
        for ex in data.get("examenes", []):
            prioridad = calcular_prioridad(cid, ex, todos_los_examenes, hoy)
            if prioridad is None:
                continue
            resultados.append(
                {
                    "course_id": cid,
                    "examen_id": ex.get("id"),
                    "fecha": ex.get("fecha"),
                    "score": prioridad["score"],
                    "dias_restantes": prioridad["componentes"]["proximidad"]["dias_restantes"],
                }
            )
            if args.write:
                ex["prioridad"] = prioridad
                cambiado = True
        if args.write and cambiado:
            exams_path.write_text(
                json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
            )

    resultados.sort(key=lambda r: -r["score"])
    print(json.dumps(resultados, indent=2, ensure_ascii=False))
    if args.write:
        print("\nEscrito en cada exams.json correspondiente.")


if __name__ == "__main__":
    main()
