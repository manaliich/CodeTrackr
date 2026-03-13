from rest_framework import serializers
from .models import CodingProblem, ViaSocketAPIKey


class CodingProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingProblem
        fields = ("id", "title", "platform", "difficulty", "status", "notes", "problem_url", "created_at")
        read_only_fields = ("id", "created_at")


class ViaSocketAPIKeySerializer(serializers.ModelSerializer):
    key = serializers.UUIDField(read_only=True)

    class Meta:
        model = ViaSocketAPIKey
        fields = ("key", "created_at", "updated_at")
        read_only_fields = ("key", "created_at", "updated_at")
