"""Documentary design guardrails; validating a spec is not user-learning proof."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=ROOT/"specs/atlas-design-v05.json"
class DesignSpecTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d=json.loads(SPEC.read_text(encoding="utf8"))
    def test_spec_marks_future_design_not_published(self):
        self.assertEqual(self.d["status"],"DESIGN_PROPOSAL_NOT_IMPLEMENTED")
        self.assertEqual(self.d["cost_policy"]["budget_usd"],0)
        self.assertTrue(self.d["cost_policy"]["cloud_only"])
        self.assertFalse(self.d["cost_policy"]["offline_pc_installation"])
    def test_no_anime_and_correct_language_model(self):
        p=self.d["presentation"]
        self.assertEqual(p["ui_language"],"es")
        self.assertEqual(p["pivot_language"],"en")
        self.assertEqual(p["study_languages"],["fr","de","ru","ja"])
        self.assertTrue({"anime","chibi"}<=set(p["forbidden_styles"]))
    def test_narrative_explains_identity_location_purpose_and_nora(self):
        self.assertEqual(len(self.d["protagonist"]["starting_explanations"]),5)
        self.assertTrue(self.d["protagonist"]["alias_optional"])
        self.assertFalse(self.d["protagonist"]["requires_real_identity"])
        self.assertIn("TEACH",self.d["story_state_machine"])
        self.assertLess(self.d["story_state_machine"].index("TEACH"),self.d["story_state_machine"].index("FREE_RECALL"))
        self.assertEqual(self.d["presentation"]["narrative_ending"],"cases_only_no_global_ending")
    def test_german_nouns_require_gender_and_article(self):
        self.assertTrue({"gender","article"}<=set(self.d["language_required_content"]["de"]))
    def test_retrieval_tracks_more_than_recognition(self):
        states=self.d["grading"]["state_categories"]
        self.assertTrue({"not_taught","exposed","recognized","free_recall","applied","durable_retention","not_assessed"}<=set(states))
        self.assertIn("speaking",self.d["grading"]["never_auto_assessed_without_independent_validation"])
        self.assertNotIn("speaking",self.d["grading"]["auto_assessed"])
        self.assertTrue(self.d["grading"]["benchmark_for_earned_badge"]["requires_language_qa"])
    def test_voice_must_be_clear_and_optional(self):
        a=self.d["sound"]
        self.assertFalse(a["default_enabled"])
        self.assertFalse(a["autoplay"])
        self.assertTrue(a["duck_music_on_speech"])
        self.assertEqual(set(a["independent_channels"]),{"speech","music","sfx"})
    def test_badges_are_not_official_certificates(self):
        b=self.d["badges"]
        self.assertFalse(b["official"])
        self.assertTrue(b["never_claim_equivalent_certification"])
        self.assertIn("skills_not_assessed",b["include"])
        self.assertIn("No constituye certificación oficial",b["notice"])
if __name__=="__main__":
    unittest.main()
