import copy
import json
import unittest
from pathlib import Path
from atlas.candidate_lexicon import audit
class LexiconTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root=Path(__file__).resolve().parents[1]
        cls.catalog=json.loads((root/"candidates/lexicon-v01/catalog.json").read_text(encoding="utf8"))
        cls.plan=json.loads((root/"candidates/lexicon-v01/learning-plan.json").read_text(encoding="utf8"))
    def test_complete_20_concepts_80_translation_entries(self):
        result=audit(self.catalog,self.plan)
        self.assertEqual(result["status"],"CANDIDATE_VALID",result["errors"])
        self.assertEqual(result["translations"],80)
    def test_unreviewed_content_must_remain_pending(self):
        r=audit(self.catalog,self.plan)
        self.assertEqual(r["linguistic_certification"],"PENDING")
        self.assertEqual(r["pedagogy_certification"],"PENDING")
    def test_missing_japanese_detected(self):
        c=copy.deepcopy(self.catalog);del c["items"][0]["languages"]["ja"]
        self.assertEqual(audit(c,self.plan)["status"],"REJECTED")
    def test_forged_publication_detected(self):
        c=copy.deepcopy(self.catalog);c["items"][0]["publication_status"]="APPROVED"
        self.assertEqual(audit(c,self.plan)["status"],"REJECTED")
    def test_missing_license_audio_detected(self):
        c=copy.deepcopy(self.catalog);c["items"][0]["audio"]["ru"]="APPROVED"
        self.assertEqual(audit(c,self.plan)["status"],"REJECTED")
    def test_unreviewed_lesson_cannot_claim_approval(self):
        p=copy.deepcopy(self.plan);p["status"]="APPROVED"
        self.assertEqual(audit(self.catalog,p)["status"],"REJECTED")
if __name__=="__main__":unittest.main()
