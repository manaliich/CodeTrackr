from django.urls import path
from .views import ViaSocketAPIKeyView, ViaSocketWebhookView, CodingProblemListView

urlpatterns = [
    path("api-key/", ViaSocketAPIKeyView.as_view(), name="viasocket-api-key"),
    path("log-problem/", ViaSocketWebhookView.as_view(), name="viasocket-log-problem"),
    path("problems/", CodingProblemListView.as_view(), name="viasocket-problems"),
]
