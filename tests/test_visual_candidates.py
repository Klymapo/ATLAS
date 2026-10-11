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
    def test_minimal_non_anime_direction_is_fixed(self):
        manifest=json.loads((Path(__file__).resolve().parents[1]/"candidates/visual-pack-v02/manifest.json").read_text())
        self.assertEqual(manifest["style_id"],"minimal-vector-noir-v1")
        self.assertGreaterEqual(manifest["character_spec"]["min_head_units"],6.0)
        self.assertIn("anime",manifest["prohibited_styles"])
        self.assertIn("chibi",manifest["prohibited_styles"])
    def test_character_heads_are_scaled_to_adult_proportions(self):
        base=Path(__file__).resolve().parents[1]/"candidates/visual-pack-v02"
        for filename in ("investigator.svg","nora-vale.svg"):
            text=(base/filename).read_text()
            self.assertIn('transform="translate(240 130) scale(.72) translate(-240 -130)"',text)
            self.assertIn('<ellipse cx="240" cy="130" rx="42" ry="55"',text)
    def test_scene_skyline_stays_inside_window(self):
        base=Path(__file__).resolve().parents[1]/"candidates/visual-pack-v02/office.svg"
        text=base.read_text()
        self.assertIn('transform="translate(688 117)"',text)
        self.assertNotIn('transform="translate(688 160)"',text)
        self.assertIn('width="80" height="111"',text)
    def test_pack_human_review_is_not_approved(self):
        manifest=json.loads((Path(__file__).resolve().parents[1]/"candidates/visual-pack-v02/manifest.json").read_text())
        self.assertEqual(manifest["state"],"awaiting-art-director-approval")
        self.assertTrue(all(x["decision"]=="pending" and x["master"] is False for x in manifest["gallery"]))

if __name__=="__main__":unittest.main()
