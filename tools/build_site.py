"""Cloud-only deterministic demo build: copies unapproved SVG sources verbatim."""
import argparse
import hashlib
import json
from pathlib import Path
from shutil import copyfile, rmtree

ASSETS=("investigator.svg","nora-vale.svg","office.svg","props.svg","expressions.svg")
FILES=("index.html","style.css","app.js","favicon.svg","data/demo-content.js")

def build(root,destination):
    root=Path(root).resolve(); destination=Path(destination).resolve()
    if destination==root or destination==Path("/"):raise ValueError("Unsafe build destination")
    if destination.exists():rmtree(destination)
    destination.mkdir(parents=True)
    sha={}
    for name in FILES:
        origin=root/"site"/name
        target=destination/name
        target.parent.mkdir(parents=True,exist_ok=True)
        copyfile(origin,target)
        sha[name]=hashlib.sha256(target.read_bytes()).hexdigest()
    manifest=json.loads((root/"candidates/visual-pack-v02/manifest.json").read_text(encoding="utf8"))
    if manifest.get("state")!="awaiting-art-director-approval" or manifest.get("style_id")!="minimal-vector-noir-v1":
        raise ValueError("Incorrect art direction or approval claims")
    if any(x.get("master") is not False or x.get("decision")!="pending" for x in manifest["gallery"]):
        raise ValueError("Unverified art marked approved")
    from atlas.candidate_visuals import audit
    result=audit(root,render=False)
    if result["result"]!="CANDIDATE_VALID" or result["art_approval"]!="PENDING":
        raise ValueError("Visual candidate checks failed")
    for name in ASSETS:
        original=root/"candidates/visual-pack-v02"/name
        target=destination/"assets"/name
        target.parent.mkdir(parents=True,exist_ok=True)
        copyfile(original,target)
        if original.read_bytes()!=target.read_bytes():raise ValueError("Source asset modified")
        sha["assets/"+name]=hashlib.sha256(target.read_bytes()).hexdigest()
    (destination/"asset-manifest.json").write_text(json.dumps({"status":"DEMO_ONLY","certification":"PENDING","assets_sha256":sha},indent=2),encoding="utf8")
    return {"result":"DEMO_ONLY","files":len(sha)+1,"path":str(destination)}

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--root",default=".");p.add_argument("--output",default="dist")
    args=p.parse_args();root=Path(args.root).resolve()
    print(json.dumps(build(root,root/args.output)))
