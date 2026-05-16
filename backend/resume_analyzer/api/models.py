from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator

class Job(models.Model):
    """Job model for storing job listings"""
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=200)
    skills_required = models.TextField(help_text="Comma-separated list of skills")
    experience_required = models.IntegerField(default=0)
    salary_range = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} at {self.company}"
    
    def get_skills_list(self):
        if not self.skills_required:
            return []
        return [skill.strip().lower() for skill in self.skills_required.split(',') if skill.strip()]
    
    class Meta:
        ordering = ['-created_at']

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(
        upload_to='resumes/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    full_text = models.TextField(blank=True)
    skills = models.TextField(blank=True, default='')
    education = models.TextField(blank=True, default='')
    experience = models.TextField(blank=True, default='')
    ats_score = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Resume - {self.uploaded_at.strftime('%Y-%m-%d')}"
    
    def get_skills_list(self):
        if not self.skills or self.skills == 'No skills found':
            return []
        return [skill.strip().lower() for skill in self.skills.split(',') if skill.strip()]
    
    class Meta:
        ordering = ['-uploaded_at']

class JobMatch(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='matches')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='matches')
    match_score = models.FloatField(default=0)
    ats_score = models.FloatField(default=0)
    matched_skills = models.TextField(default='')
    missing_skills = models.TextField(default='')
    recommendations = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['resume', 'job']
        ordering = ['-match_score']
    
    def __str__(self):
        return f"{self.resume.user.username} - {self.job.title}: {self.match_score}%"