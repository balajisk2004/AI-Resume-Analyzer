from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Job, Resume, JobMatch

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at', 'skills', 'education', 'experience', 'ats_score']
        read_only_fields = ['uploaded_at', 'skills', 'education', 'experience', 'ats_score']

class JobMatchSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company = serializers.CharField(source='job.company', read_only=True)
    location = serializers.CharField(source='job.location', read_only=True)
    
    class Meta:
        model = JobMatch
        fields = ['id', 'job_title', 'company', 'location', 'match_score', 'ats_score', 
                  'matched_skills', 'missing_skills', 'recommendations', 'created_at']