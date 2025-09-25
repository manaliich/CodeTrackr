from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    github_url = models.URLField(blank=True, null=True)
    leetcode_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Question(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('needs_revision', 'Needs Revision'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    platform = models.CharField(max_length=100, blank=True, null=True)  # LeetCode, HackerRank, etc.
    problem_url = models.URLField(blank=True, null=True)
    solution_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    time_spent = models.IntegerField(default=0)  # in minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    technologies = models.CharField(max_length=500, blank=True, null=True)  # comma-separated
    notes = models.TextField(blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('question_created', 'Question Created'),
        ('question_updated', 'Question Updated'),
        ('question_completed', 'Question Completed'),
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('project_completed', 'Project Completed'),
        ('profile_updated', 'Profile Updated'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    related_question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True, blank=True)
    related_project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Activities'

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.created_at}"
