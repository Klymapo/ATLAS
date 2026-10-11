import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image, ImageDraw
from atlas.gate import Atlas, report

class QualityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.root=Path(self.tmp.name)
        for name in ("master/visual","published","assets","evidence","content","candidates"):
            (self.root/name).mkdir(parents=True,exist_ok=True)
        self.write("master/policy.json",{"palette":["#182635","#FFFFFF"],"visual_palette_min":0.98,"visual_identity_iou_min":0.94})
        self.write("master/visual/registry.json",{"references":{}})
        self.write("published/manifest.json",{"items":[]})
    def tearDown(self): self.tmp.cleanup()
    def write(self,path,obj):
        p=self.root/path;p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(json.dumps(obj,ensure_ascii=False),encoding="utf-8")
    def sha(self,path):return hashlib.sha256((self.root/path).read_bytes()).hexdigest()
    def icon(self,path,shape="circle"):
        image=Image.new("RGBA",(128,128),(0,0,0,0))
        draw=ImageDraw.Draw(image)
        if shape=="circle":draw.ellipse((20,20,100,100),fill=(24,38,53,255))
        else:draw.rectangle((1,1,126,126),fill=(24,38,53,255))
        image.save(self.root/path)
    def master(self):
        self.icon("master/visual/ref.png")
        self.write("master/visual/registry.json",{"references":{"r":{"path":"master/visual/ref.png","sha256":self.sha("master/visual/ref.png"),"approval_issue":"https://github.com/Klymapo/ATLAS/issues/1"}}})
    def item(self,path,kind="asset"):
        return {"id":"one","kind":kind,"path":path,"sha256":self.sha(path),"reference_id":"r","comparison_mode":"identity","creator":"writer","approvals":{}}
    def result(self,item):
        self.write("published/manifest.json",{"items":[item]})
        return {(x.gate,x.status) for x in Atlas(self.root).audit()}
    def test_empty_manifest_does_not_certify_content(self):
        self.assertIn(("integrator","PASS"),{(x.gate,x.status) for x in Atlas(self.root).audit()})
        self.assertEqual(report(Atlas(self.root).audit(),self.root)["result"],"INFRASTRUCTURE_READY")
    def test_visual_without_master_fails(self):
        self.icon("assets/a.png")
        self.assertIn(("visual","FAIL"),self.result(self.item("assets/a.png")))
    def test_visual_clone_remains_pending(self):
        self.master();self.icon("assets/a.png")
        self.assertIn(("visual-human","PENDING"),self.result(self.item("assets/a.png")))
    def test_changed_master_blocks(self):
        self.master();self.icon("assets/a.png");self.icon("master/visual/ref.png",shape="square")
        states=self.result(self.item("assets/a.png"))
        self.assertIn(("visual-master","FAIL"),states)
    def test_silhouette_drift_fails(self):
        self.master();self.icon("assets/a.png",shape="square")
        self.assertIn(("visual","FAIL"),self.result(self.item("assets/a.png")))
    def test_same_silhouette_different_internal_colors_rejected(self):
        self.master();self.icon("assets/a.png")
        with Image.open(self.root/"assets/a.png") as image:
            im=image.copy()
        im.putdata([(255,255,255,p[3]) if p[3] else p for p in im.getdata()])
        im.save(self.root/"assets/a.png")
        self.assertIn(("visual","FAIL"),self.result(self.item("assets/a.png")))
    def test_new_character_style_remains_pending_independent_review(self):
        self.master();self.icon("assets/a.png",shape="square")
        item=self.item("assets/a.png");item["comparison_mode"]="style"
        self.assertIn(("visual-human","PENDING"),self.result(item))
    def test_self_approval_fails(self):
        self.master();self.icon("assets/a.png")
        (self.root/"evidence/a.txt").write_text("mock")
        item=self.item("assets/a.png")
        item["approvals"]["visual-human"]={"decision":"approved","reviewer":"writer","reviewed_sha256":self.sha("assets/a.png"),"evidence":["evidence/a.txt"],"reason":"mock"}
        self.assertIn(("visual-human","FAIL"),self.result(item))
    def test_changed_reviewed_sha_fails(self):
        self.master();self.icon("assets/a.png")
        (self.root/"evidence/a.txt").write_text("mock")
        item=self.item("assets/a.png")
        item["approvals"]["visual-human"]={"decision":"approved","reviewer":"editor","reviewed_sha256":"0"*64,"evidence":["evidence/a.txt"],"reason":"mock"}
        self.assertIn(("visual-human","FAIL"),self.result(item))
    def test_concept_missing_languages_fails(self):
        self.write("content/word.json",{"english":{"headword":"key"},"sense_es":"llave","languages":{"fr":{"word":"clé","reading":"clé","example":"Une clé","sources":["https://www.larousse.fr/"]}}})
        self.assertIn(("linguist-ja","FAIL"),self.result(self.item("content/word.json","concept")))
    def test_lesson_requires_transfer(self):
        self.write("content/lesson.json",{"objective":"vocab","level":"A1","prerequisites":[],"retrieval_practice":"cards","feedback":"OK","assessment":"OK","spaced_review":True})
        self.assertIn(("pedagogy","FAIL"),self.result(self.item("content/lesson.json","lesson")))
    def test_final_game_is_rejected(self):
        self.write("content/case.json",{"ends_game":True,"premise":"a","solution":"b","clues":["a","b"],"fairness_test":"yes","continuation_hook":"yes"})
        self.assertIn(("narrative","FAIL"),self.result(self.item("content/case.json","case")))
    def test_candidate_cannot_be_published(self):
        self.write("candidates/l.json",{"objective":"test"})
        self.assertIn(("integrator","FAIL"),self.result(self.item("candidates/l.json","lesson")))
    def test_missing_manifest_items_fails(self):
        self.write("published/manifest.json",{})
        self.assertIn(("integrator","FAIL"),{(x.gate,x.status) for x in Atlas(self.root).audit()})
    def test_missing_audio_license_fails(self):
        path=self.root/"assets/x.mp3";path.write_bytes(b"test")
        self.assertIn(("audio","FAIL"),self.result(self.item("assets/x.mp3","audio")))
    def test_report_pending_blocks(self):
        self.master();self.icon("assets/a.png")
        self.result(self.item("assets/a.png"))
        self.assertEqual(report(Atlas(self.root).audit(),self.root)["result"],"BLOCKED")
    def test_path_escape(self):
        with self.assertRaises(ValueError): Atlas(self.root).path("../../bad")
if __name__=="__main__":unittest.main()
