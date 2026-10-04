#!/usr/bin/env python3
"""Lee el calendario exportado del EVA (iCal) y compara con el estado anterior.

Uso: python3 agenda/eva_calendario.py
Lee el link desde la variable de entorno EVA_CALENDARIO_URL (nunca se imprime).
Escribe agenda/estado.json y muestra un JSON con eventos, nuevos, cambiados y urgentes.
"""
import json, os, sys, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

AR = timezone(timedelta(hours=-3))
ESTADO = Path(__file__).with_name("estado.json")


def bajar_ics(url):
    req = urllib.request.Request(url, headers={"User-Agent": "agenda-uca"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def parse_fecha(valor):
    valor = valor.strip()
    if len(valor) == 8:  # solo fecha
        return datetime.strptime(valor, "%Y%m%d").replace(tzinfo=AR)
    if valor.endswith("Z"):
        return datetime.strptime(valor, "%Y%m%dT%H%M%SZ").replace(tzinfo=timezone.utc).astimezone(AR)
    return datetime.strptime(valor[:15], "%Y%m%dT%H%M%S").replace(tzinfo=AR)


def desescapar(t):
    return t.replace("\\n", "\n").replace("\\,", ",").replace("\;", ";").replace("\\\\", "\\").strip()


def parse_ics(texto):
    lineas = []
    for l in texto.replace("\r\n", "\n").split("\n"):
        if l[:1] in (" ", "\t") and lineas:
            lineas[-1] += l[1:]
        else:
            lineas.append(l)
    eventos, ev = [], None
    for l in lineas:
        if l == "BEGIN:VEVENT":
            ev = {}
        elif l == "END:VEVENT" and ev is not None:
            eventos.append(ev)
            ev = None
        elif ev is not None and ":" in l:
            clave, valor = l.split(":", 1)
            ev[clave.split(";")[0].upper()] = valor
    salida = []
    for e in eventos:
        if "DTSTART" not in e:
            continue
        inicio = parse_fecha(e["DTSTART"])
        salida.append({
            "uid": e.get("UID", ""),
            "titulo": desescapar(e.get("SUMMARY", "")),
            "materia": desescapar(e.get("CATEGORIES", "")),
            "descripcion": desescapar(e.get("DESCRIPTION", ""))[:500],
            "inicio": inicio.isoformat(),
            "modificado": e.get("LAST-MODIFIED", ""),
        })
    return sorted(salida, key=lambda x: x["inicio"])


def main():
    url = os.environ.get("EVA_CALENDARIO_URL", "").strip()
    if not url:
        print(json.dumps({"error": "Falta la variable de entorno EVA_CALENDARIO_URL"}))
        sys.exit(2)
    texto = bajar_ics(url)
    if "BEGIN:VCALENDAR" not in texto:
        print(json.dumps({"error": "El EVA no devolvió un calendario (¿link vencido o mal copiado?)",
                          "inicio_respuesta": texto[:200]}, ensure_ascii=False))
        sys.exit(3)
    eventos = parse_ics(texto)
    ahora = datetime.now(AR)
    anterior = json.loads(ESTADO.read_text()) if ESTADO.exists() else {}
    previos = {e["uid"]: e for e in anterior.get("eventos", [])}
    nuevos = [e for e in eventos if e["uid"] not in previos]
    cambiados = [e for e in eventos if e["uid"] in previos and
                 (previos[e["uid"]]["inicio"], previos[e["uid"]]["titulo"]) != (e["inicio"], e["titulo"])]
    futuros = [e for e in eventos if datetime.fromisoformat(e["inicio"]) >= ahora]
    urgentes = [e for e in futuros if datetime.fromisoformat(e["inicio"]) - ahora <= timedelta(hours=72)]
    ESTADO.write_text(json.dumps({"actualizado": ahora.isoformat(), "eventos": eventos},
                                 ensure_ascii=False, indent=2))
    print(json.dumps({"ahora": ahora.isoformat(), "primera_vez": not previos,
                      "proximos": futuros, "nuevos": nuevos, "cambiados": cambiados,
                      "urgentes_72h": urgentes}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
