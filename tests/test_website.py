import json
import tempfile
import unittest
from pathlib import Path
from tools.build_site import build
ROOT=Path(__file__).resolve().parents[1]

class WebsiteTests(unittest.TestCase):
    def test_concepts_and_languages(self):
        raw=(ROOT/"site/data/demo-content.js").read_text(encoding="utf8")
        info=json.loads(raw.removeprefix("window.ATLAS_DEMO = ").strip().removesuffix(";"))
        self.assertEqual((info["status"],info["lang_ui"],info["lang_pivot"]),("DEMO_ONLY_UNVERIFIED","es","en"))
        self.assertEqual((len(info["concepts"]),len(info["memoryPairs"]),len(info["clues"])),(4,4,4))
        self.assertEqual(sum(c["require"] for c in info["clues"]),3)
        self.assertEqual(sum(i["correct"] for i in info["deduction"]["options"]),1)
        for c in info["concepts"]:
            for lang in ("fr","de","ru","ja"):self.assertTrue(c[lang]["w"])
    def test_catalog_remains_unpublished(self):
        self.assertEqual(json.loads((ROOT/"published/manifest.json").read_text())["items"],[])
        self.assertIn("SIN CERTIFICAR",(ROOT/"site/index.html").read_text())
    def test_game_has_main_routes_and_export(self):
        markup=(ROOT/"site/index.html").read_text()
        code=(ROOT/"site/app.js").read_text()
        for s in ("office","investigation","memory","deck","progress"):self.assertIn('data-route="'+s+'"',markup)
        for token in ("localStorage","fileDownload","memory-card","data-answer","speechSynthesis","printCards"):
            self.assertIn(token,code)
    def test_build_copies_true_original_svg_sources(self):
        with tempfile.TemporaryDirectory() as d:
            dest=Path(d)/"testsite"
            r=build(ROOT,dest)
            self.assertEqual(r["result"],"DEMO_ONLY")
            self.assertEqual(json.loads((dest/"asset-manifest.json").read_text())["certification"],"PENDING")
            for name in ("office.svg","nora-vale.svg","investigator.svg"):
                self.assertEqual((ROOT/"candidates/visual-pack-v02"/name).read_bytes(),(dest/"assets"/name).read_bytes())
            self.assertTrue((dest/"index.html").exists())

if __name__=="__main__":unittest.main()
