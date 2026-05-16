from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Avg, Count, Q, F
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Job, Resume, JobMatch
from .serializers import *
from .resume_parser import ResumeParser, JobMatcher, ATS_Calculator
import os
import json

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'user': UserSerializer(user).data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'message': 'Login successful'
                })
        return Response({
            'success': False,
            'error': 'Invalid username or password'
        }, status=status.HTTP_401_UNAUTHORIZED)

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Job.objects.all()
        return Job.objects.filter(is_active=True)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_jobs = Job.objects.filter(is_active=True).count()
        return Response({'total_jobs': total_jobs})

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        print(f"Received file: {file.name}, size: {file.size}")
        
        # Save file temporarily
        temp_path = default_storage.save(f'temp_{file.name}', ContentFile(file.read()))
        full_path = default_storage.path(temp_path)
        
        try:
            # Parse resume
            parser = ResumeParser()
            parsed_data = parser.parse_resume(full_path)
            
            print(f"Parsed data - Skills: {parsed_data['skills'][:100]}")
            
            # Calculate ATS score for resume
            ats_calc = ATS_Calculator()
            ats_score = ats_calc.calculate_ats_score(
                parsed_data['full_text'], 
                parsed_data['full_text']
            )
            
            # Create resume record
            resume = Resume.objects.create(
                user=request.user,
                file=file,
                full_text=parsed_data['full_text'],
                skills=parsed_data['skills'],
                education=parsed_data['education'],
                experience=parsed_data['experience'],
                ats_score=ats_score
            )
            
            print(f"Resume saved with ID: {resume.id}, ATS Score: {ats_score}")
            
            # Calculate job matches
            match_count = self.calculate_job_matches(resume)
            print(f"Calculated {match_count} job matches")
            
            # Get recommended jobs for immediate display
            recommended_jobs = JobMatch.objects.filter(resume=resume).select_related('job').order_by('-match_score')[:10]
            recommended_serializer = JobMatchSerializer(recommended_jobs, many=True)
            
            serializer = self.get_serializer(resume)
            response_data = serializer.data
            response_data['recommended_jobs'] = recommended_serializer.data
            response_data['ats_score'] = ats_score
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error processing resume: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        finally:
            default_storage.delete(temp_path)
    
    def calculate_job_matches(self, resume):
        matcher = JobMatcher()
        ats_calc = ATS_Calculator()
        active_jobs = Job.objects.filter(is_active=True)
        resume_skills = resume.get_skills_list()
        resume_text = resume.full_text
        
        print(f"Resume skills list: {resume_skills}")
        print(f"Number of active jobs: {active_jobs.count()}")
        
        match_count = 0
        for job in active_jobs:
            job_skills = job.get_skills_list()
            
            # Calculate match score using enhanced algorithm
            match_result = matcher.calculate_enhanced_match_score(
                resume_skills, 
                job_skills, 
                resume_text, 
                f"{job.description} {job.requirements}",
                resume.experience,
                job.experience_required
            )
            
            # Calculate ATS score for this specific job match
            ats_score = ats_calc.calculate_ats_score(
                resume_text, 
                f"{job.description} {job.requirements}"
            )
            
            # Create or update match
            job_match, created = JobMatch.objects.update_or_create(
                resume=resume,
                job=job,
                defaults={
                    'match_score': match_result['match_score'],
                    'ats_score': ats_score,
                    'matched_skills': match_result['matched_skills'],
                    'missing_skills': match_result['missing_skills'],
                    'recommendations': match_result['recommendations']
                }
            )
            match_count += 1
            print(f"Match score for {job.title}: {match_result['match_score']}%")
        
        return match_count
    
    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        resume = self.get_object()
        matches = JobMatch.objects.filter(resume=resume).select_related('job').order_by('-match_score')
        serializer = JobMatchSerializer(matches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def recommended_jobs(self, request, pk=None):
        """Get top recommended jobs for a resume"""
        resume = self.get_object()
        matches = JobMatch.objects.filter(resume=resume).select_related('job').order_by('-match_score')[:10]
        serializer = JobMatchSerializer(matches, many=True)
        return Response(serializer.data)

class DashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        print(f"Fetching stats for user: {request.user.username}")
        
        resumes = Resume.objects.filter(user=request.user)
        total_resumes = resumes.count()
        print(f"Total resumes: {total_resumes}")
        
        # Default values
        avg_match_score = 0
        avg_ats_score = 0
        top_matches = []
        latest_resume_data = None
        
        if total_resumes > 0:
            # Get latest resume
            latest_resume = resumes.first()
            print(f"Latest resume ID: {latest_resume.id}, ATS Score: {latest_resume.ats_score}")
            
            # Get latest resume data for display
            latest_resume_data = {
                'id': latest_resume.id,
                'skills': latest_resume.skills,
                'ats_score': latest_resume.ats_score,
                'uploaded_at': latest_resume.uploaded_at
            }
            
            # Get matches for latest resume
            matches = JobMatch.objects.filter(resume=latest_resume).select_related('job').order_by('-match_score')
            match_count = matches.count()
            print(f"Number of matches: {match_count}")
            
            if match_count > 0:
                # Calculate averages
                avg_match_score = matches.aggregate(avg_match=Avg('match_score'))['avg_match'] or 0
                avg_ats_score = matches.aggregate(avg_ats=Avg('ats_score'))['avg_ats'] or 0
                print(f"Avg match score: {avg_match_score}, Avg ATS: {avg_ats_score}")
                
                # Get top 6 matches for dashboard
                top_matches_queryset = matches[:6]
                top_matches = JobMatchSerializer(top_matches_queryset, many=True).data
                print(f"Top matches count: {len(top_matches)}")
        
        response_data = {
            'total_resumes': total_resumes,
            'average_match_score': round(avg_match_score, 2),
            'average_ats_score': round(avg_ats_score, 2),
            'latest_matches': top_matches,
            'latest_resume': latest_resume_data
        }
        
        print(f"Dashboard response: {response_data}")
        return Response(response_data)