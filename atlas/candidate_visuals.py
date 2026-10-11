"""Lint/render candidate SVG art without treating it as artistically certified.

Fail closed on unsafe SVG, off-palette colors, missing assets, and accidental
promotion. The decision PENDING remains until an independent real art review.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import sys
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw
import cairosvg

SVG_NS = "http://www.w3.org/2000/svg"
SAFE_TAGS = {"svg", "title", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon"}
SAFE_ATTRS = {"width","height","viewBox","role","aria-label","stroke","stroke-width","stroke-linejoin",
              "stroke-linecap","fill","opacity","cx","cy","r","rx","ry","x","y","x1","y1","x2",
              "y2","d","points","transform"}
PALETTE = {"#182635","#F0E6D5","#B99558","#8F4952","#508B83","#FFFFFF","#000000"}

def verify_svg(raw: bytes) -> list[str]:
    errors = []
    if len(raw) > 300_000:
        return ["Archivo SVG demasiado grande"]
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        return [f"SVG inválido: {exc}"]
    if root.tag != "{%s}svg" % SVG_NS:
        errors.append("Raíz SVG inválida")
    if not root.attrib.get("aria-label"):
        errors.append("Falta descripción accesible")
    try:
        w,h = int(root.attrib["width"]),int(root.attrib["height"])
        if not 64<=w<=2048 or not 64<=h<=2048:
            errors.append("Dimensiones fuera de rango")
    except (KeyError,ValueError):
        errors.append("Dimensiones no numéricas")
    for node in root.iter():
        tag = node.tag.rsplit("}",1)[-1]
        if tag not in SAFE_TAGS:
            errors.append(f"Elemento prohibido: {tag}")
        for attr,value in node.attrib.items():
            attrname=attr.rsplit("}",1)[-1]
            if attrname not in SAFE_ATTRS:
                errors.append(f"Atributo prohibido: {attrname}")
            if "url(" in value.lower() or "http:" in value.lower() or "https:" in value.lower() or "javascript:" in value.lower():
                errors.append(f"Referencia externa o ejecución: {attrname}")
            if attrname in ("stroke","fill") and value not in PALETTE | {"none"}:
                errors.append(f"Color fuera de paleta: {value}")
    titles = [n for n in root if n.tag.rsplit("}",1)[-1]=="title" and (n.text or "").strip()]
    if not titles:
        errors.append("Falta título de imagen")
    return sorted(set(errors))

def audit(root: Path, render: bool = True) -> dict:
    root=root.resolve()
    base=root/"candidates/visual-pack-v02"
    m=json.loads((base/"manifest.json").read_text(encoding="utf8"))
    errors=[]
    if m.get("state")!="awaiting-art-director-approval":
        errors.append("La propuesta debe permanecer PENDING")
    if m.get("style_id")!="minimal-vector-noir-v1":
        errors.append("ID de estilo incorrecto")
    palette=m.get("palette",{})
    if set(palette.values()) != PALETTE - {"#000000","#FFFFFF"} | {"#000000","#FFFFFF"}:
        errors.append("Paleta maestra modificada")
    spec=m.get("character_spec",{})
    if not (6.0 <= spec.get("min_head_units",0) < spec.get("max_head_units",0) <= 8.0):
        errors.append("Proporciones no realistas o sin especificar (6–8 cabezas)")
    if spec.get("shading") != "flat fills, no gradients":
        errors.append("Sombras fuera de las reglas vectoriales")
    if not {"anime","manga","chibi","kawaii"}.issubset(set(m.get("prohibited_styles",[]))):
        errors.append("Faltan exclusiones explícitas de anime/chibi")
    expected={"investigator.svg","nora-vale.svg","office.svg","props.svg","expressions.svg"}
    gallery=m.get("gallery",[])
    paths=[]
    for entry in gallery:
        p=entry.get("path","")
        if not isinstance(p,str):
            errors.append("Ruta no válida");continue
        filename=Path(p).name
        paths.append(filename)
        full=(root/p).resolve()
        if not full.is_relative_to(base) or full.suffix.lower()!=".svg":
            errors.append(f"Ruta de candidato inválida: {p}");continue
        if entry.get("decision")!="pending" or entry.get("master") is not False:
            errors.append(f"Candidato presentado como aprobado: {p}")
        if not full.is_file():
            errors.append(f"No existe: {p}");continue
        content=full.read_bytes()
        errors.extend(f"{filename}: {x}" for x in verify_svg(content))
    if len(paths)!=len(set(paths)) or set(paths)!=expected:
        errors.append("Inventario visual incompleto o duplicado")
    previews=[]
    if render and not errors:
        dest=root/"reports/visual-v02"
        dest.mkdir(parents=True,exist_ok=True)
        for entry in gallery:
            p=root/entry["path"]
            raw=p.read_bytes()
            png=cairosvg.svg2png(bytestring=raw,output_width=720)
            img=Image.open(BytesIO(png)).convert("RGBA")
            (dest/(p.stem+".png")).write_bytes(png)
            previews.append((p.stem,img))
        board=Image.new("RGB",(1260,1270),"#F0E6D5")
        d=ImageDraw.Draw(board)
        d.text((38,18),"ATLAS V0.2  |  CANDIDATOS - PENDIENTES DE APROBACION",fill="#182635")
        slots=[(25,62,590,575),(645,62,1235,575),(25,630,600,900),(645,630,1235,900),(25,944,1235,1210)]
        for ((name,im),(x1,y1,x2,y2)) in zip(previews,slots):
            d.rounded_rectangle((x1,y1,x2,y2),radius=20,fill="#FFFFFF",outline="#B99558",width=5)
            d.text((x1+18,y1+14),name.upper(),fill="#182635")
            im.thumbnail((x2-x1-30,y2-y1-65))
            background=Image.new("RGBA",im.size,"#F0E6D5")
            background.alpha_composite(im)
            board.paste(background.convert("RGB"),(int((x1+x2-im.width)/2),y1+48))
        board.save(dest/"contact-sheet.png")
    return {"result":"CANDIDATE_VALID" if not errors else "REJECTED",
            "art_approval":"PENDING","errors":errors,
            "items":[{"path":entry["path"],"sha256":hashlib.sha256((root/entry["path"]).read_bytes()).hexdigest()}
                     for entry in gallery if (root/entry["path"]).is_file()]}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",default=".")
    args=parser.parse_args()
    try:
        root=Path(args.root).resolve()
        result=audit(root)
        out=root/"reports/visual-v02"
        out.mkdir(parents=True,exist_ok=True)
        (out/"report.json").write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf8")
        print(json.dumps({k:v for k,v in result.items() if k!="items"},ensure_ascii=False))
        return 0 if result["result"]=="CANDIDATE_VALID" else 1
    except Exception as exc:
        print(f"REJECTED: {exc}",file=sys.stderr)
        return 1
if __name__=="__main__":
    sys.exit(main())
