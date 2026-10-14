import subprocess
import unittest

class ReviewIntegrityTests(unittest.TestCase):
    def test_node_review_integrity(self):
        result = subprocess.run(["node", "--test", "tests/review_integrity.test.mjs"], check=False)
        self.assertEqual(result.returncode, 0)
