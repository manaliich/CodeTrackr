import uuid
from django.db import models
from django.contrib.auth.models import User


class ViaSocketAPIKey(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="viasocket_api_key")
    key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"ViaSocket API Key for {self.user.username}"

    def regenerate(self):
        self.key = uuid.uuid4()
        self.save()


DIFFICULTY_CHOICES = [
    ("easy", "Easy"),
    ("medium", "Medium"),
    ("hard", "Hard"),
]

STATUS_CHOICES = [
    ("solved", "Solved"),
    ("attempted", "Attempted"),
    ("revisit", "Need to Revisit"),
]

PLATFORM_CHOICES = [
    ("leetcode", "LeetCode"),
    ("hackerrank", "HackerRank"),
    ("codeforces", "Codeforces"),
    ("codechef", "CodeChef"),
    ("geeksforgeeks", "GeeksForGeeks"),
    ("other", "Other"),
]


class CodingProblem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="coding_problems")
    title = models.CharField(max_length=255)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, default="other")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="solved")
    notes = models.TextField(blank=True, default="")
    problem_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.platform}) - {self.user.username}"
