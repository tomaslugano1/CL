#!/usr/bin/env python3
"""Lector de SOLO LECTURA del EVA (Moodle UCA). Ver agenda/REGLAS.md.

Uso: python3 agenda/eva_moodle.py            -> resumen JSON de todas las materias
     python3 agenda/eva_moodle.py --bajar <materia> <nombre> <carpeta>  -> descarga archivos del aula (solo lectura)
     python3 agenda/eva_moodle.py --novedades [--horas=26] -> solo avisos de foro recientes y menciones de evaluaciones
     python3 agenda/eva_moodle.py --info     -> solo verifica la llave (nombre de usuario)
La llave se lee de EVA_TOKEN y nunca se imprime. No guarda nada en disco.
"""
import base64, html, json, os, re, sys, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

SITIO = "https://eva.uca.edu.ar/webservice/rest/server.php"
AR = timezone(timedelta(hours=-3))

# Candado: únicas funciones permitidas, todas de lectura.
SOLO_LECTURA = {
    "core_webservice_get_site_info",
    "core_enrol_get_users_courses",
    "core_course_get_contents",
    "mod_forum_get_forums_by_courses",
    "mod_forum_get_forum_discussions",
    "mod_assign_get_assignments",
}


def leer_token():
    crudo = os.environ.get("EVA_TOKEN", "").strip()
    if not crudo:
        sys.exit(json.dumps({"error": "Falta la variable de entorno EVA_TOKEN"}))
    if re.fullmatch(r"[0-9a-f]{32}", crudo):
        return crudo
    m = re.search(r"token=([A-Za-z0-9+/=_-]+)", crudo)
    b64 = m.group(1) if m else crudo
    try:
        partes = base64.b64decode(b64 + "=" * (-len(b64) % 4)).decode().split(":::")
        return partes[1]
    except Exception:
        sys.exit(json.dumps({"error": "EVA_TOKEN no tiene el formato esperado (¿se copió la línea roja entera?)"}))


TOKEN = None


def ws(funcion, **params):
    if funcion not in SOLO_LECTURA:
        raise PermissionError(f"Bloqueado por REGLAS.md: {funcion} no es de solo lectura")
    datos = {"wstoken": TOKEN, "wsfunction": funcion, "moodlewsrestformat": "json"}
    for k, v in params.items():
        if isinstance(v, list):
            for i, x in enumerate(v):
                datos[f"{k}[{i}]"] = x
        else:
            datos[k] = v
    req = urllib.request.Request(SITIO, data=urllib.parse.urlencode(datos).encode())
    with urllib.request.urlopen(req, timeout=60) as r:
        res = json.loads(r.read().decode())
    if isinstance(res, dict) and res.get("exception"):
        raise RuntimeError(f"{funcion}: {res.get('errorcode')} - {res.get('message')}")
    return res


def bajar_archivos(cursos, filtro_materia, filtro_nombre, destino):
    """Descarga (solo lectura) archivos del aula cuyo nombre contenga filtro_nombre."""
    os.makedirs(destino, exist_ok=True)
    bajados = []
    for c in cursos:
        if filtro_materia.lower() not in c["fullname"].lower():
            continue
        for s in ws("core_course_get_contents", courseid=c["id"]):
            for m in s.get("modules", []):
                for f in m.get("contents", []) or []:
                    url, nombre = f.get("fileurl", ""), f.get("filename", "")
                    if not url.startswith("https://eva.uca.edu.ar/webservice/pluginfile.php/"):
                        continue
                    if filtro_nombre.lower() not in (m["name"] + " " + nombre).lower():
                        continue
                    sep = "&" if "?" in url else "?"
                    ruta = os.path.join(destino, re.sub(r"[^\w.\- ]", "_", nombre))
                    with urllib.request.urlopen(url + sep + urllib.parse.urlencode({"token": TOKEN}), timeout=120) as r, open(ruta, "wb") as out:
                        out.write(r.read())
                    bajados.append({"seccion": s["name"], "recurso": m["name"], "archivo": ruta})
    return bajados


def texto(h, n=1500):
    t = re.sub(r"<br\s*/?>|</p>|</li>|</h\d>", "\n", h or "", flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"https?://\S+", "<link>", t)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", t)).strip()[:n]


def fecha(ts):
    return datetime.fromtimestamp(ts, AR).strftime("%a %d/%m/%Y %H:%M") if ts else None


def main():
    global TOKEN
    TOKEN = leer_token()
    info = ws("core_webservice_get_site_info")
    if "--info" in sys.argv:
        print(json.dumps({"ok": True, "usuario": info.get("fullname")}, ensure_ascii=False))
        return
    cursos = [c for c in ws("core_enrol_get_users_courses", userid=info["userid"])
              if not c.get("hidden") and (c.get("enddate", 0) == 0 or c["enddate"] > datetime.now().timestamp())]
    if "--bajar" in sys.argv:
        i = sys.argv.index("--bajar")
        materia, nombre, destino = sys.argv[i + 1], sys.argv[i + 2], sys.argv[i + 3]
        print(json.dumps(bajar_archivos(cursos, materia, nombre, destino), ensure_ascii=False, indent=1))
        return
    ids = [c["id"] for c in cursos]
    tareas = {}
    for c in ws("mod_assign_get_assignments", courseids=ids).get("courses", []):
        tareas[c["id"]] = [{"nombre": a["name"], "vence": fecha(a.get("duedate")),
                            "consigna": texto(a.get("intro"), 600)} for a in c.get("assignments", [])]
    foros = {}
    for f in ws("mod_forum_get_forums_by_courses", courseids=ids):
        discusiones = ws("mod_forum_get_forum_discussions", forumid=f["id"], sortorder=1, perpage=8).get("discussions", [])
        foros.setdefault(f["course"], []).append({"foro": f["name"], "temas": [
            {"titulo": d["subject"], "fecha": fecha(d.get("created")), "ts": d.get("created", 0),
             "texto": texto(d.get("message"), 800)}
            for d in discusiones]})
    salida = []
    for c in cursos:
        secciones = []
        for s in ws("core_course_get_contents", courseid=c["id"]):
            mods = [{"tipo": m["modname"], "nombre": m["name"], "texto": texto(m.get("description"), 600)}
                    for m in s.get("modules", []) if m.get("visible", 1)]
            secciones.append({"seccion": s["name"], "resumen": texto(s.get("summary")), "items": mods})
        salida.append({"materia": c["fullname"], "secciones": secciones,
                       "tareas": tareas.get(c["id"], []), "foros": foros.get(c["id"], [])})
    # Resumen de novedades: avisos de foro recientes y menciones de evaluaciones en el aula
    horas = 26
    for a in sys.argv:
        if a.startswith("--horas="):
            horas = int(a.split("=", 1)[1])
    limite = datetime.now().timestamp() - horas * 3600
    clave = re.compile(r"parcial|recuperatorio|examen|evaluaci[oó]n|final|coloquio|integrador", re.I)
    avisos, menciones = [], []
    for m in salida:
        for f in m["foros"]:
            for t in f["temas"]:
                if t["ts"] >= limite:
                    avisos.append({"materia": m["materia"], "titulo": t["titulo"], "fecha": t["fecha"], "texto": t["texto"][:400]})
        for s_ in m["secciones"]:
            for txt in [s_["resumen"]] + [i["nombre"] + ": " + i["texto"] for i in s_["items"]]:
                for linea in txt.split("\n"):
                    if clave.search(linea) and re.search(r"\d{1,2}[/ ]|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado", linea, re.I):
                        menciones.append({"materia": m["materia"], "texto": linea.strip()[:300]})
    if "--novedades" in sys.argv:
        print(json.dumps({"ahora": datetime.now(AR).isoformat(), "horas": horas,
                          "avisos_recientes": avisos, "menciones_evaluaciones": menciones}, ensure_ascii=False, indent=1))
        return
    print(json.dumps({"ahora": datetime.now(AR).isoformat(), "materias": salida,
                      "avisos_recientes": avisos, "menciones_evaluaciones": menciones}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
