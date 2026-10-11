"""ATLAS v0.2.1: candidate lexicon integrity checks, NOT a linguistic truth oracle."""
from __future__ import annotations
import argparse
import json
import sys
from pathlib import Path

LANGS=("fr","de","ru","ja")
def audit(catalog:dict, plan:dict)->dict:
    errors=[]
    items=catalog.get("items",[])
    if catalog.get("status")!="CANDIDATE_UNVERIFIED" or catalog.get("pivot_language")!="en" or catalog.get("ui_language")!="es":
        errors.append("Estado de candidatos o idiomas base incorrectos")
    if not isinstance(items,list) or len(items)!=20:
        errors.append("Se requieren 20 conceptos candidatos")
        items=items if isinstance(items,list) else []
    ids=set();words=set()
    for d in items:
        ident=d.get("id")
        if not ident or ident in ids:
            errors.append(f"ID faltante/duplicado {ident}")
        ids.add(ident)
        english=d.get("english",{}).get("headword")
        if not english or english in words:errors.append(f"Palabra inglesa faltante/duplicada {english}")
        words.add(english)
        if not d.get("meaning_es") or d.get("publication_status")!="PENDING":
            errors.append(f"Sentido o estado no confirmado para {ident}")
        langs=d.get("languages",{})
        if set(langs)!=set(LANGS):errors.append(f"Idiomas incompletos {ident}")
        aud=d.get("audio",{})
        if set(aud)!=set(LANGS) or any(x not in ("MISSING","UNVERIFIED") for x in aud.values()):
            errors.append(f"Audio marcado sin licencia confirmada: {ident}")
        for lang in LANGS:
            cell=langs.get(lang,{})
            if not all(cell.get(f) for f in ("word","reading","example","sources_for_reviewer")):
                errors.append(f"Ficha {lang} incompleta en {ident}")
            if cell.get("review_status")!="PENDING":
                errors.append(f"Ficha {lang} reclama revisión no acreditada en {ident}")
            if lang in ("fr","de") and not (cell.get("article") and cell.get("grammatical_gender")):
                errors.append(f"Género y artículo faltantes en {lang} {ident}")
    if plan.get("status")!="PENDING_PEDAGOGICAL_REVIEW":
        errors.append("Plan marcado como aprobado sin revisión independiente")
    sessions=plan.get("sessions",[])
    if len(sessions)<5:errors.append("Faltan sesiones pedagógicas")
    for s in sessions:
        for ident in s.get("concepts",[]):
            if ident not in ids:errors.append(f"Lección con concepto desconocido {ident}")
        if not s.get("retrieval") or not s.get("feedback"):
            errors.append(f"Sesión {s.get('id')} sin feedback o recuperación")
    return {"status":"CANDIDATE_VALID" if not errors else "REJECTED",
            "linguistic_certification":"PENDING", "pedagogy_certification":"PENDING",
            "concepts":len(items),"translations":len(items)*len(LANGS),"errors":errors}

def main():
    p=argparse.ArgumentParser();p.add_argument("--root",default=".")
    args=p.parse_args()
    try:
        root=Path(args.root)
        catalog=json.loads((root/"candidates/lexicon-v01/catalog.json").read_text(encoding="utf-8"))
        plan=json.loads((root/"candidates/lexicon-v01/learning-plan.json").read_text(encoding="utf-8"))
        result=audit(catalog,plan)
        dest=root/"reports/lexicon-v01";dest.mkdir(parents=True,exist_ok=True)
        (dest/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
        print(json.dumps(result,ensure_ascii=False))
        return 0 if result["status"]=="CANDIDATE_VALID" else 1
    except (OSError,ValueError,TypeError,KeyError) as e:
        print("REJECTED: "+str(e),file=sys.stderr);return 1
if __name__=="__main__":sys.exit(main())
