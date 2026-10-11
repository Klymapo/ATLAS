import json
import tempfile
import unittest
from pathlib import Path
from atlas.candidate_visuals import audit, verify_svg, PALETTE

class CandidateVisualTests(unittest.TestCase):
    def test_actual_candidate_pack_matches_strict_style_rules(self):
        result=audit(Path(__file__).resolve().parents[1],render=False)
        self.assertEqual(result["result"],"CANDIDATE_VALID", result["errors"])
        self.assertEqual(result["art_approval"],"PENDING")
        self.assertEqual(len(result["items"]),5)
    def test_neon_color_rejected(self):
        bad=b'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" aria-label="bad"><title>bad</title><g><rect width="40" height="30" fill="#FF00FF"/></g></svg>'
        self.assertTrue(any("Color fuera" in x for x in verify_svg(bad)))
    def test_external_image_rejected(self):
        bad=b'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" aria-label="bad"><title>bad</title><image href="https://example.org/bad.png"/></svg>'
        self.assertTrue(any("prohibido" in x.lower() for x in verify_svg(bad)))
    def test_script_rejected(self):
        bad=b'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" aria-label="bad"><title>bad</title><script>alert(1)</script></svg>'
        self.assertTrue(any("Elemento prohibido" in x for x in verify_svg(bad)))
    def test_invalid_geometry_rejected(self):
        bad=b'<svg xmlns="http://www.w3.org/2000/svg" width="0" height="128" aria-label="bad"><title>bad</title></svg>'
        self.assertTrue(any("Dimensiones fuera" in x for x in verify_svg(bad)))
    def test_palette_exactly_seven_canonical_colors(self):
        self.assertEqual(len(PALETTE),7)
        self.assertIn("#182635",PALETTE)
        self.assertNotIn("#FF00FF",PALETTE)
    def test_pack_human_review_is_not_approved(self):
        manifest=json.loads((Path(__file__).resolve().parents[1]/"candidates/visual-pack-v02/manifest.json").read_text())
        self.assertEqual(manifest["state"],"awaiting-art-director-approval")
        self.assertTrue(all(x["decision"]=="pending" and x["master"] is False for x in manifest["gallery"]))

if __name__=="__main__":unittest.main()
