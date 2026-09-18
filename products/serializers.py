from rest_framework import serializers
from django.utils.text import slugify
from .models import ProductBrand

class ProductBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBrand
        fields = ['id', 'name', 'name_en', 'slug', 'logo', 'country', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        name = attrs.get('name')
        slug = attrs.get('slug')
        
        # If slug is not provided, generate it from name
        if not slug and name:
            slug = slugify(name, allow_unicode=True)
            # Ensure slug is unique
            original_slug = slug
            counter = 1
            while ProductBrand.objects.filter(slug=slug).exists():
                slug = f"{original_slug}-{counter}"
                counter += 1
            attrs['slug'] = slug
        elif slug:
            # If slug IS provided, ensure it is unique
            if ProductBrand.objects.filter(slug=slug).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError({"slug": "این اسلاگ قبلاً ثبت شده است."})
                
        return attrs
