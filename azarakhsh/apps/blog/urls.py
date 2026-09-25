from django.urls import path
from .views import BlogPostListView, BlogPostDetailView

urlpatterns = [
    path('posts/', BlogPostListView.as_view(), name='blog-posts-list'),
    path('posts/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-post-detail'),
]
