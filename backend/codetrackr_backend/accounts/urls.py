from django.urls import path
from .views import (
    RegisterView, UserProfileView, QuestionListCreateView, QuestionDetailView,
    ProjectListCreateView, ProjectDetailView, ActivityListView, dashboard_stats
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Authentication
    path('signup/', RegisterView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Questions
    path('questions/', QuestionListCreateView.as_view(), name='question-list-create'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    
    # Projects
    path('projects/', ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    
    # Activities
    path('activities/', ActivityListView.as_view(), name='activity-list'),
    
    # Dashboard
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
]