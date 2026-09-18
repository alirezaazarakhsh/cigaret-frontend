from rest_framework import serializers
from .models import ProductBrand

class ProductBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBrand
        fields = ['id', 'name', 'name_en', 'slug', 'logo', 'country', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("نام برند (فارسی) الزامی است.")
        return value
