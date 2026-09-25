from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    imageUrl = serializers.SerializerMethodField()
    reportageImageUrl = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'meta_description',
            'imageUrl', 'category', 'faqs', 'is_reportage',
            'reportage_title', 'reportage_content', 'reportage_button_text',
            'reportage_button_link', 'reportageImageUrl', 'reportage_badge',
            'created_at', 'updated_at'
        ]

    def get_imageUrl(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"

    def get_reportageImageUrl(self, obj):
        if obj.reportage_image and hasattr(obj.reportage_image, 'url'):
            return obj.reportage_image.url
        return None
