from django.contrib import admin
from .models import ViaSocketAPIKey, CodingProblem


@admin.register(ViaSocketAPIKey)
class ViaSocketAPIKeyAdmin(admin.ModelAdmin):
    list_display = ("user", "key", "created_at", "updated_at")
    readonly_fields = ("key", "created_at", "updated_at")


@admin.register(CodingProblem)
class CodingProblemAdmin(admin.ModelAdmin):
    list_display = ("title", "platform", "difficulty", "status", "user", "created_at")
    list_filter = ("platform", "difficulty", "status")
    search_fields = ("title", "user__username")
