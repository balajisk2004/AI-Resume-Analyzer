from django.contrib import admin
from .models import Job, Resume, JobMatch

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'is_active', 'created_at']
    list_filter = ['is_active', 'company']
    search_fields = ['title', 'company', 'skills_required']
    list_editable = ['is_active']

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'uploaded_at', 'ats_score']
    search_fields = ['user__username']
    readonly_fields = ['full_text', 'skills', 'education', 'experience', 'ats_score']

@admin.register(JobMatch)
class JobMatchAdmin(admin.ModelAdmin):
    list_display = ['resume', 'job', 'match_score', 'ats_score', 'created_at']
    list_filter = ['match_score']