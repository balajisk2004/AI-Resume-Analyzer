from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, JobViewSet, ResumeViewSet, DashboardViewSet

router = DefaultRouter()
router.register('auth', AuthViewSet, basename='auth')
router.register('jobs', JobViewSet, basename='jobs')
router.register('resumes', ResumeViewSet, basename='resumes')
router.register('dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]