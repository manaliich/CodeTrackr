from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ViaSocketAPIKey, CodingProblem


def get_jwt_token(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class ViaSocketAPIKeyViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="TestPass123!")

    def auth_headers(self):
        token = get_jwt_token(self.user)
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_get_creates_api_key_on_first_request(self):
        response = self.client.get("/api/viasocket/api-key/", **self.auth_headers())
        self.assertEqual(response.status_code, 200)
        self.assertIn("key", response.data)
        self.assertEqual(ViaSocketAPIKey.objects.filter(user=self.user).count(), 1)

    def test_get_returns_same_key_on_second_request(self):
        self.client.get("/api/viasocket/api-key/", **self.auth_headers())
        self.client.get("/api/viasocket/api-key/", **self.auth_headers())
        self.assertEqual(ViaSocketAPIKey.objects.filter(user=self.user).count(), 1)

    def test_post_regenerates_api_key(self):
        # Create initial key
        resp1 = self.client.get("/api/viasocket/api-key/", **self.auth_headers())
        old_key = resp1.data["key"]
        # Regenerate
        resp2 = self.client.post("/api/viasocket/api-key/", **self.auth_headers())
        self.assertEqual(resp2.status_code, 200)
        new_key = resp2.data["key"]
        self.assertNotEqual(old_key, new_key)

    def test_unauthenticated_request_denied(self):
        response = self.client.get("/api/viasocket/api-key/")
        self.assertEqual(response.status_code, 401)


class ViaSocketWebhookViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="webhookuser", password="TestPass123!")
        self.api_key_obj = ViaSocketAPIKey.objects.create(user=self.user)
        self.api_key = str(self.api_key_obj.key)

    def test_log_problem_minimal_fields(self):
        response = self.client.post(
            "/api/viasocket/log-problem/",
            {"title": "Two Sum"},
            HTTP_X_API_KEY=self.api_key,
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["problem"]["title"], "Two Sum")
        self.assertEqual(CodingProblem.objects.filter(user=self.user).count(), 1)

    def test_log_problem_all_fields(self):
        payload = {
            "title": "Longest Substring",
            "platform": "leetcode",
            "difficulty": "medium",
            "status": "solved",
            "notes": "Sliding window approach",
            "problem_url": "https://leetcode.com/problems/longest-substring/",
        }
        response = self.client.post(
            "/api/viasocket/log-problem/",
            payload,
            HTTP_X_API_KEY=self.api_key,
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        problem = CodingProblem.objects.get(user=self.user, title="Longest Substring")
        self.assertEqual(problem.platform, "leetcode")
        self.assertEqual(problem.difficulty, "medium")
        self.assertEqual(problem.status, "solved")
        self.assertEqual(problem.notes, "Sliding window approach")

    def test_missing_api_key_header_returns_401(self):
        response = self.client.post(
            "/api/viasocket/log-problem/",
            {"title": "Test Problem"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_invalid_api_key_returns_401(self):
        response = self.client.post(
            "/api/viasocket/log-problem/",
            {"title": "Test Problem"},
            HTTP_X_API_KEY="00000000-0000-0000-0000-000000000000",
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_missing_title_returns_400(self):
        response = self.client.post(
            "/api/viasocket/log-problem/",
            {"platform": "leetcode"},
            HTTP_X_API_KEY=self.api_key,
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("title", response.data["errors"])


class CodingProblemListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="listuser", password="TestPass123!")
        self.other_user = User.objects.create_user(username="other", password="TestPass123!")
        CodingProblem.objects.create(user=self.user, title="Problem A")
        CodingProblem.objects.create(user=self.user, title="Problem B")
        CodingProblem.objects.create(user=self.other_user, title="Problem C")

    def auth_headers(self):
        token = get_jwt_token(self.user)
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_returns_only_users_problems(self):
        response = self.client.get("/api/viasocket/problems/", **self.auth_headers())
        self.assertEqual(response.status_code, 200)
        titles = [p["title"] for p in response.data]
        self.assertIn("Problem A", titles)
        self.assertIn("Problem B", titles)
        self.assertNotIn("Problem C", titles)

    def test_unauthenticated_denied(self):
        response = self.client.get("/api/viasocket/problems/")
        self.assertEqual(response.status_code, 401)
