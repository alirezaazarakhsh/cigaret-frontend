from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db import models
from .models import BlogPost
from .serializers import BlogPostSerializer

class BlogPostListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BlogPostSerializer

    def get_queryset(self):
        queryset = BlogPost.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(models.Q(title__icontains=search) | models.Q(content__icontains=search))
        return queryset

class BlogPostDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
