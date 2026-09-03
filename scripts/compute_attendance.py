#!/usr/bin/env python3
"""Calcula la asistencia de una materia a partir de su cronograma y las inasistencias
registradas, en vez de confiar en el porcentaje que muestra el SIU.

Uso:
    python3 scripts/compute_attendance.py <course_id> [--hoy YYYY-MM-DD] [--write]

Requiere que exista data/courses/<course_id>/cronograma.json (lista de eventos con fecha y
tipo). Si no existe, avisa que no se puede calcular en vez de inventar un número.

--write actualiza data/courses/<course_id>/attendance.json con los campos calculados
(nivel_fuente 4), sin tocar los campos de nivel_fuente 1 (inasistencias_registradas,
porcentaje_reportado_siu).
"""
import argparse
import json
import math
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSES = ROOT / "data" / "courses"
PROFILE = ROOT / "data" / "profile.json"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("course_id")
    ap.add_argument("--hoy", default=None, help="Fecha de referencia YYYY-MM-DD (default: hoy real)")
    ap.add_argument("--write", action="store_true", help="Escribe el resultado en attendance.json")
    args = ap.parse_args()

    course_dir = COURSES / args.course_id
    cronograma_path = course_dir / "cronograma.json"
    attendance_path = course_dir / "attendance.json"

    if not attendance_path.exists():
        print(f"ERROR: no existe {attendance_path}")
        sys.exit(1)

    attendance = load_json(attendance_path)
    hoy = date.fromisoformat(args.hoy) if args.hoy else date.today()

    if not cronograma_path.exists():
        print(
            f"Sin cronograma estructurado para '{args.course_id}' -> no se puede recalcular "
            f"de forma independiente todavia. Falta: {cronograma_path}"
        )
        return

    cronograma = load_json(cronograma_path)
    eventos = cronograma["eventos"]

    profile = load_json(PROFILE)
    regla = profile["regla_asistencia_minima"]["valor"]

    total_eventos = len(eventos)
    clases = [e for e in eventos if e["tipo"] == "clase"]
    n_clases = len(clases)
    clases_transcurridas = len([e for e in clases if date.fromisoformat(e["fecha"]) <= hoy])

    inasistencias = attendance.get(
        "inasistencias_actuales", len(attendance.get("inasistencias_registradas", []))
    )

    if n_clases == 0:
        print("El cronograma no tiene ningun evento de tipo 'clase'. Revisar el archivo.")
        return

    max_faltas = math.floor(n_clases * (1 - regla))
    faltas_disponibles = max_faltas - inasistencias
    porcentaje_recalculado = round((n_clases - inasistencias) / n_clases * 100, 2)

    # No confiamos ciegamente en como el SIU calcula su %: probamos distintas hipotesis
    # de denominador y vemos cual coincide con lo reportado.
    hipotesis = {}
    for nombre, denom in [
        ("solo_clases_tipo_clase", n_clases),
        ("todos_los_eventos_del_cuatrimestre", total_eventos),
        ("clases_transcurridas_hasta_hoy", clases_transcurridas),
    ]:
        if denom:
            hipotesis[nombre] = round((denom - inasistencias) / denom * 100, 2)

    reportado = attendance.get("porcentaje_reportado_siu")
    coincidencias = [
        k for k, v in hipotesis.items() if reportado is not None and abs(v - reportado) < 0.01
    ]

    if faltas_disponibles <= 0:
        riesgo = "alto"
    elif faltas_disponibles <= 2:
        riesgo = "medio"
    else:
        riesgo = "bajo"

    resultado = {
        "clases_totales_calendario": total_eventos,
        "clases_computables": n_clases,
        "clases_transcurridas": clases_transcurridas,
        "porcentaje_recalculado": porcentaje_recalculado,
        "clases_restantes": n_clases - clases_transcurridas,
        "maximo_faltas_permitidas": max_faltas,
        "faltas_disponibles_ahora": faltas_disponibles,
        "margen_seguridad": faltas_disponibles,
        "riesgo": riesgo,
    }

    print(
        json.dumps(
            {
                "resultado": resultado,
                "porcentaje_reportado_siu": reportado,
                "hipotesis_calculo_siu": hipotesis,
                "coincide_con": coincidencias or "ninguna de las probadas",
            },
            indent=2,
            ensure_ascii=False,
        )
    )

    if args.write:
        attendance.update(resultado)
        attendance["nivel_fuente"] = 4
        nota = (
            f"Recalculado por scripts/compute_attendance.py el {date.today().isoformat()}. "
            f"El % reportado por el SIU ({reportado}%) coincide con la hipotesis de calculo: "
            f"{', '.join(coincidencias) if coincidencias else 'ninguna de las probadas (revisar)'}."
        )
        attendance["incertidumbre"] = [
            i for i in attendance.get("incertidumbre", []) if "No pude recalcular" not in i
        ]
        attendance["incertidumbre"].append(nota)
        attendance["ultima_actualizacion"] = date.today().isoformat()
        attendance_path.write_text(
            json.dumps(attendance, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(f"\nEscrito en {attendance_path}")


if __name__ == "__main__":
    main()
