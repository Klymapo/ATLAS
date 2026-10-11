"""ATLAS — calidad fail-closed sin redes, sin tokens ni servicios de IA."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image

LANGUAGES = ("fr", "de", "ru", "ja")
TRUSTED = {
 "fr": ("larousse.fr", "cnrtl.fr", "dictionnaire-academie.fr", "fr.wiktionary.org"),
 "de": ("duden.de", "dwds.de", "de.wiktionary.org"),
 "ru": ("gramota.ru", "ru.wiktionary.org", "pushkininstitute.ru"),
 "ja": ("jisho.org", "kotobank.jp", "dictionary.goo.ne.jp", "ja.wiktionary.org"),
}

@dataclass
class Finding:
    gate: str
    status: str
    detail: str
    item: str = "global"

class Atlas:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.findings = []
        self.policy = self.read("master/policy.json")
        self.registry = self.read("master/visual/registry.json")
    def path(self, rel):
        if not isinstance(rel, str) or not rel or rel.startswith(("/", "\\\\")):
            raise ValueError("Se requiere una ruta relativa")
        p = self.root.joinpath(rel).resolve()
        if not p.is_relative_to(self.root):
            raise ValueError("Ruta sale del repositorio")
        return p
    def read(self, rel):
        return json.loads(self.path(rel).read_text(encoding="utf-8"))
    def sha(self, rel):
        return hashlib.sha256(self.path(rel).read_bytes()).hexdigest()
    def log(self, gate, status, detail, item="global"):
        self.findings.append(Finding(gate, status, str(detail), str(item)))
    def approval(self, item, gate):
        rel = item.get("path", "")
        att = item.get("approvals", {}).get(gate, {})
        if not isinstance(att, dict) or not all(att.get(k) for k in ("decision","reviewer","reviewed_sha256","evidence","reason")):
            return self.log(gate, "PENDING", "Falta atestación y evidencia", rel)
        if att["decision"] != "approved":
            return self.log(gate, "FAIL", "Revisión rechazada", rel)
        if att["reviewer"] == item.get("creator"):
            return self.log(gate, "FAIL", "Autoaprobación prohibida", rel)
        if att["reviewed_sha256"] != self.sha(rel):
            return self.log(gate, "FAIL", "El contenido cambió después de revisarlo", rel)
        if not isinstance(att["evidence"], list) or not att["evidence"]:
            return self.log(gate, "PENDING", "No hay evidencias", rel)
        if not all(isinstance(e, str) and self.path(e).is_file() for e in att["evidence"]):
            return self.log(gate, "FAIL", "Evidencia inexistente", rel)
        self.log(gate, "PASS", "Atestación documental; identidad depende de revisión GitHub", rel)
    def masters(self):
        refs = self.registry.get("references")
        if not isinstance(refs, dict):
            self.log("visual-master", "FAIL", "Registro inválido"); return
        for key, ref in refs.items():
            try:
                if self.sha(ref["path"]) != ref["sha256"] or not ref.get("approval_issue"):
                    raise ValueError("Máster sin hash válido o registro de aprobación")
                self.log("visual-master", "PASS", "Referencia íntegra", key)
            except (KeyError, ValueError, OSError) as ex:
                self.log("visual-master", "FAIL", str(ex), key)
    @staticmethod
    def source_good(url, lang):
        if not isinstance(url, str):
            return False
        p = urlparse(url)
        host = (p.hostname or "").lower()
        return p.scheme == "https" and any(host == d or host.endswith("." + d) for d in TRUSTED[lang])
    def check_item(self, item):
        if not isinstance(item, dict):
            self.log("integrator", "FAIL", "Entrada no es objeto"); return
        rel = item.get("path", "")
        if not isinstance(rel, str) or rel.startswith("candidates/"):
            self.log("integrator", "FAIL", "Prohibido publicar rutas de candidatos", item.get("id", "sin-id")); return
        try:
            if not self.path(rel).is_file() or self.sha(rel) != item.get("sha256"):
                raise ValueError("Archivo ausente o SHA incorrecto")
        except (ValueError, OSError) as ex:
            self.log("integrator", "FAIL", str(ex), item.get("id", rel)); return
        kind = item.get("kind")
        if kind == "asset": self.asset(item)
        elif kind == "concept": self.concept(item)
        elif kind == "lesson": self.lesson(item)
        elif kind == "case": self.case(item)
        elif kind == "audio": self.audio(item)
        else: self.log("integrator", "FAIL", "Tipo desconocido", item.get("id", rel))
    def asset(self, item):
        rel = item["path"]; key = item.get("reference_id"); master = self.registry.get("references", {}).get(key)
        if not master:
            self.log("visual", "FAIL", "No hay máster aprobado", rel); return
        try:
            if self.sha(master["path"]) != master["sha256"] or not master.get("approval_issue"):
                raise ValueError("Máster inválido")
            with Image.open(self.path(master["path"])) as source, Image.open(self.path(rel)) as proposed:
                if proposed.format != "PNG": raise ValueError("Solo PNG auditados")
                if min(proposed.size) < 64 or max(proposed.size) > 4096: raise ValueError("Resolución fuera de rango")
                a = source.convert("RGBA").resize((128,128))
                b = proposed.convert("RGBA").resize((128,128))
                mode = item.get("comparison_mode","identity")
                if mode not in ("identity","style"): raise ValueError("Modo visual inválido")
                colors = [tuple(bytes.fromhex(h.lstrip("#"))) for h in self.policy["palette"]]
                pixels = [p for p in b.getdata() if p[3] >= 128]
                if not pixels: raise ValueError("Asset transparente o vacío")
                color_rate = sum(any(max(abs(p[i]-col[i]) for i in range(3)) <= 32 for col in colors) for p in pixels)/len(pixels)
                alpha_a = [p[3] >= 128 for p in a.getdata()]
                alpha_b = [p[3] >= 128 for p in b.getdata()]
                inter = sum(u and v for u,v in zip(alpha_a,alpha_b))
                union = sum(u or v for u,v in zip(alpha_a,alpha_b))
                iou = inter/max(1,union)
                if color_rate < self.policy["visual_palette_min"]:
                    raise ValueError(f"Paleta fuera de estándar: {color_rate:.3f}")
                if mode == "identity" and iou < self.policy["visual_identity_iou_min"]:
                    raise ValueError(f"Silueta distinta del máster: {iou:.3f}")
                if mode == "identity" and (a.getchannel("A").getextrema() == (255,255) or b.getchannel("A").getextrema() == (255,255)):
                    raise ValueError("Falta transparencia de personaje/objeto")
                self.log("visual", "PASS", f"Chequeo técnico {mode}: paleta {color_rate:.3f}, silueta {iou:.3f}. No certifica identidad artística", rel)
        except (OSError, ValueError, KeyError, TypeError) as ex:
            self.log("visual", "FAIL", str(ex), rel)
        self.approval(item, "visual-human")
    def concept(self, item):
        rel = item["path"]
        try:
            data = self.read(rel)
            if not data.get("sense_es") or not data.get("english",{}).get("headword"):
                raise ValueError("Sin significado de referencia en inglés y español")
            for lang in LANGUAGES:
                entry = data.get("languages",{}).get(lang,{})
                if not all(entry.get(x) for x in ("word","reading","example","sources")):
                    self.log("linguist-"+lang,"FAIL","Entrada incompleta",rel)
                elif not all(self.source_good(u,lang) for u in entry["sources"]):
                    self.log("linguist-"+lang,"FAIL","Fuente no autorizada (no implica validación del contenido)",rel)
                else:
                    self.log("linguist-"+lang,"PASS","Estructura y dominios admitidos; veracidad pendiente de revisión",rel)
                self.approval(item, "linguist-"+lang+"-human")
            self.approval(item,"semantic-human")
        except (ValueError, KeyError, TypeError, OSError) as ex:
            self.log("linguists","FAIL",str(ex),rel)
    def lesson(self,item):
        rel=item["path"]
        try:
            d=self.read(rel)
            required=("objective","level","prerequisites","retrieval_practice","feedback","transfer_task","assessment","spaced_review")
            if any(x not in d or d[x] is None or d[x] == "" for x in required) or not d["retrieval_practice"] or not d["transfer_task"] or d["spaced_review"] is not True:
                raise ValueError("Lección sin componentes pedagógicos obligatorios")
            if d["level"] not in ("pre-A1","A1","A2","B1","B2","C1","C2"):
                raise ValueError("Nivel inválido")
            self.log("pedagogy","PASS","Estructura didáctica comprobada; eficacia aún por evaluar",rel)
        except (ValueError, OSError, TypeError) as ex:
            self.log("pedagogy","FAIL",str(ex),rel)
        self.approval(item,"pedagogy-human")
    def case(self,item):
        rel=item["path"]
        try:
            d=self.read(rel)
            if d.get("ends_game") or d.get("outcome") == "final_game_end":
                raise ValueError("Casos cerrados sí, final global no")
            if any(not d.get(k) for k in ("premise","solution","clues","fairness_test","continuation_hook")):
                raise ValueError("El caso no ofrece solución y pistas suficientes")
            if not isinstance(d["clues"],list) or len(d["clues"]) < 2:
                raise ValueError("Faltan pistas")
            self.log("narrative","PASS","Estructura de misterio verificada; solvencia narrativa pendiente",rel)
        except (ValueError, TypeError, OSError) as ex:
            self.log("narrative","FAIL",str(ex),rel)
        self.approval(item,"narrative-human")
    def audio(self,item):
        rel=item["path"]
        if self.path(rel).suffix.lower() not in (".wav",".ogg",".mp3") or not all(item.get(k) for k in ("license","attribution","transcript")):
            self.log("audio","FAIL","Faltan formato, licencia, atribución o transcripción",rel)
        else:
            self.log("audio","PASS","Metadatos completos; voz y licencia por verificar",rel)
        self.approval(item,"audio-human")
    def audit(self):
        self.masters()
        manifest = self.read("published/manifest.json")
        entries = manifest.get("items")
        if not isinstance(entries,list):
            self.log("integrator","FAIL","Manifiesto sin lista items");return self.findings
        if not entries:
            self.log("integrator","PASS","Infraestructura revisada; NO hay contenidos aprobados")
            return self.findings
        ids = set()
        for item in entries:
            ident = item.get("id") if isinstance(item,dict) else None
            if not ident or ident in ids:
                self.log("integrator","FAIL","ID duplicado o ausente",ident or "sin-id");continue
            ids.add(ident)
            self.check_item(item)
        return self.findings

def report(findings, root):
    counts = {s:sum(f.status==s for f in findings) for s in ("PASS","FAIL","PENDING")}
    status = "APPROVED" if counts["FAIL"]==0 and counts["PENDING"]==0 and findings else "BLOCKED"
    obj = {"result":status,"scope":"infrastructure+published-items", "counts":counts,"checks":[asdict(f) for f in findings], "utc":datetime.now(timezone.utc).isoformat()}
    directory=Path(root)/"reports"
    directory.mkdir(parents=True,exist_ok=True)
    (directory/"atlas.json").write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding="utf-8")
    (directory/"atlas.md").write_text("# ATLAS: "+status+"\n\n"+"\n".join(f"- {f.status}: {f.gate} / {f.item}: {f.detail}" for f in findings),encoding="utf-8")
    return obj

def main():
    parser=argparse.ArgumentParser();parser.add_argument("--root",default=".")
    args=parser.parse_args()
    try:
        gate=Atlas(args.root)
        result=report(gate.audit(),args.root)
    except (ValueError, OSError, TypeError, KeyError) as ex:
        result=report([Finding("integrator","FAIL",str(ex))],args.root)
    print(json.dumps({"result":result["result"],"counts":result["counts"]},ensure_ascii=False))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        Path(os.environ["GITHUB_STEP_SUMMARY"]).write_text((Path(args.root)/"reports/atlas.md").read_text(encoding="utf-8"),encoding="utf-8")
    return 0 if result["result"]=="APPROVED" else 1
if __name__=="__main__": sys.exit(main())
