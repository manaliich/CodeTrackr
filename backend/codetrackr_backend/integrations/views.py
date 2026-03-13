from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User

from .models import ViaSocketAPIKey, CodingProblem
from .serializers import CodingProblemSerializer, ViaSocketAPIKeySerializer


class ViaSocketAPIKeyView(APIView):
    """
    GET  /api/viasocket/api-key/ - Retrieve (or create) the authenticated user's API key
    POST /api/viasocket/api-key/ - Regenerate the API key
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        api_key, _ = ViaSocketAPIKey.objects.get_or_create(user=request.user)
        serializer = ViaSocketAPIKeySerializer(api_key)
        return Response(serializer.data)

    def post(self, request):
        api_key, created = ViaSocketAPIKey.objects.get_or_create(user=request.user)
        if not created:
            api_key.regenerate()
        serializer = ViaSocketAPIKeySerializer(api_key)
        return Response(serializer.data)


class ViaSocketWebhookView(APIView):
    """
    POST /api/viasocket/log-problem/
    Authenticated via X-API-Key header (the user's ViaSocket API key).
    Creates a new CodingProblem entry for the key's owner.

    Required fields:
      - title      (string)  Problem title
    Optional fields:
      - platform   (string)  One of: leetcode, hackerrank, codeforces, codechef, geeksforgeeks, other
      - difficulty (string)  One of: easy, medium, hard
      - status     (string)  One of: solved, attempted, revisit  (default: solved)
      - notes      (string)  Any personal notes
      - problem_url (string) URL of the problem
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        api_key_value = request.headers.get("X-API-Key", "").strip()
        if not api_key_value:
            return Response(
                {"error": "Missing X-API-Key header."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            api_key_obj = ViaSocketAPIKey.objects.select_related("user").get(key=api_key_value)
        except (ViaSocketAPIKey.DoesNotExist, Exception):
            return Response(
                {"error": "Invalid API key."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = CodingProblemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=api_key_obj.user)
            return Response(
                {"success": True, "problem": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CodingProblemListView(APIView):
    """
    GET /api/viasocket/problems/
    Returns all CodingProblems for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        problems = CodingProblem.objects.filter(user=request.user)
        serializer = CodingProblemSerializer(problems, many=True)
        return Response(serializer.data)
