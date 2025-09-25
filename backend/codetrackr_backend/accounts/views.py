from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import UserProfile, Question, Project, Activity
from .serializers import (
    RegisterSerializer, UserProfileSerializer, QuestionSerializer, 
    ProjectSerializer, ActivitySerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        question = serializer.save(user=self.request.user)
        # Create activity
        Activity.objects.create(
            user=self.request.user,
            activity_type='question_created',
            description=f'Created question: {question.title}',
            related_question=question
        )

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        question = serializer.save()
        
        # Create activity for status changes
        if old_status != question.status:
            if question.status == 'completed':
                Activity.objects.create(
                    user=self.request.user,
                    activity_type='question_completed',
                    description=f'Completed question: {question.title}',
                    related_question=question
                )
            else:
                Activity.objects.create(
                    user=self.request.user,
                    activity_type='question_updated',
                    description=f'Updated question: {question.title}',
                    related_question=question
                )

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        project = serializer.save(user=self.request.user)
        # Create activity
        Activity.objects.create(
            user=self.request.user,
            activity_type='project_created',
            description=f'Created project: {project.title}',
            related_project=project
        )

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        old_status = self.get_object().status
        project = serializer.save()
        
        # Create activity for status changes
        if old_status != project.status:
            if project.status == 'completed':
                Activity.objects.create(
                    user=self.request.user,
                    activity_type='project_completed',
                    description=f'Completed project: {project.title}',
                    related_project=project
                )
            else:
                Activity.objects.create(
                    user=self.request.user,
                    activity_type='project_updated',
                    description=f'Updated project: {project.title}',
                    related_project=project
                )

class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user)[:20]  # Last 20 activities

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the user"""
    user = request.user
    
    # Calculate stats
    total_questions = Question.objects.filter(user=user).count()
    completed_questions = Question.objects.filter(user=user, status='completed').count()
    total_projects = Project.objects.filter(user=user).count()
    completed_projects = Project.objects.filter(user=user, status='completed').count()
    
    # Recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_activities_count = Activity.objects.filter(
        user=user, 
        created_at__gte=week_ago
    ).count()
    
    # Questions by difficulty
    questions_by_difficulty = Question.objects.filter(user=user).values('difficulty').annotate(
        count=Count('id')
    )
    
    # Projects by status
    projects_by_status = Project.objects.filter(user=user).values('status').annotate(
        count=Count('id')
    )
    
    return Response({
        'total_questions': total_questions,
        'completed_questions': completed_questions,
        'total_projects': total_projects,
        'completed_projects': completed_projects,
        'recent_activities_count': recent_activities_count,
        'questions_by_difficulty': list(questions_by_difficulty),
        'projects_by_status': list(projects_by_status),
        'completion_rate_questions': round((completed_questions / total_questions * 100) if total_questions > 0 else 0, 1),
        'completion_rate_projects': round((completed_projects / total_projects * 100) if total_projects > 0 else 0, 1),
    })