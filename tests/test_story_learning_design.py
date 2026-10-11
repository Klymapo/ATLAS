"""Design contract invariants only; not a substitute for executable learning tests."""
import json
import unittest
from pathlib import Path
S=Path(__file__).resolve().parents[1]/"specs/atlas-story-learning-v06.json"
class StoryLearningDesignTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.d=json.loads(S.read_text(encoding="utf-8"))
    def test_design_is_not_falsely_published(self):
        self.assertEqual(self.d["status"],"DESIGN_CONTRACT_NOT_IMPLEMENTED")
        self.assertEqual(self.d["learning"]["content_certification"],"PENDING")
    def test_prologue_introduces_and_teaches_before_testing(self):
        seq=[x["id"] for x in self.d["prologue"]]
        for part in ("arrival","nora","identity","teach","guided","recall","investigate","deduction","report","spaced_review"):
            self.assertIn(part,seq)
        self.assertLess(seq.index("nora"),seq.index("teach"))
        self.assertLess(seq.index("teach"),seq.index("guided"))
        self.assertLess(seq.index("guided"),seq.index("recall"))
        self.assertLess(seq.index("investigate"),seq.index("deduction"))
    def test_player_has_identity_and_ongoing_game(self):
        self.assertTrue(self.d["story"]["player"]["alias_optional"])
        self.assertFalse(self.d["story"]["player"]["forced_backstory"])
        self.assertEqual(len(self.d["story"]["context_before_exam"]),5)
        self.assertFalse(self.d["story"]["global_ending"])
        self.assertFalse(self.d["case_001"]["ends_universe"])
    def test_four_languages_and_english_pivot(self):
        self.assertEqual(self.d["learning"]["pivot_language"],"en")
        self.assertEqual(self.d["learning"]["ui_language"],"es")
        self.assertEqual(set(self.d["learning"]["targets"]),{"fr","de","ru","ja"})
        self.assertEqual(len(self.d["starter_concepts"]),4)
    def test_german_gender_and_article_are_mandatory(self):
        for c in self.d["starter_concepts"]:
            self.assertTrue(c["de"]["article"])
            self.assertIn(c["de"]["gender"],("m","f","n"))
            self.assertTrue(c["de"]["form"].startswith(c["de"]["article"]+" "))
        self.assertIn("article",self.d["learning"]["german_nouns_must_have"])
    def test_learning_is_not_passive_or_one_match(self):
        requires=set(self.d["learning"]["mastery_requires"])
        self.assertTrue({"independent_recall","applied","delayed_recall"}<=requires)
        self.assertIn("memory_match_only",self.d["learning"]["unacceptable_for_mastery"])
        self.assertIn("speaking",self.d["learning"]["not_assessed_by_default"])
    def test_case_evidence_and_limits_are_grounded(self):
        e={x["id"]:x for x in self.d["case_001"]["evidence"]}
        self.assertTrue(all(x["is_visible"] for x in e.values()))
        self.assertTrue(set(self.d["case_001"]["deduction_requires"])<=set(e))
        self.assertIn("intent_proven",self.d["case_001"]["cannot_conclude"])
        self.assertTrue(self.d["case_001"]["local_resolution"])
    def test_zero_cost_and_no_official_badges(self):
        g=self.d["game"]
        self.assertTrue(g["static_cloud_only"])
        self.assertTrue(g["rank_separate_from_language_level"])
        self.assertTrue(g["badges_nonofficial"])
        self.assertTrue(g["never_start_sound_automatically"])
if __name__=="__main__":unittest.main()
