from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, Question, Project, Activity

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {'email': {'required': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        # Create user profile
        UserProfile.objects.create(user=user)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'github_url', 'leetcode_url', 'linkedin_url', 'bio', 
                 'created_at', 'updated_at')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class ProjectSerializer(serializers.ModelSerializer):
    technologies_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def get_technologies_list(self, obj):
        if obj.technologies:
            return [tech.strip() for tech in obj.technologies.split(',')]
        return []

class ActivitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    question_title = serializers.CharField(source='related_question.title', read_only=True)
    project_title = serializers.CharField(source='related_project.title', read_only=True)
    
    class Meta:
        model = Activity
        fields = ('id', 'username', 'activity_type', 'description', 
                 'question_title', 'project_title', 'created_at')
        read_only_fields = ('user', 'created_at')