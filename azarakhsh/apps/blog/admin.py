from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_reportage', 'created_at')
    list_filter = ('category', 'is_reportage', 'created_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('اطلاعات اصلی مقاله', {
            'fields': ('title', 'slug', 'category', 'image', 'excerpt', 'content', 'meta_description')
        }),
        ('سوالات متداول (JSON)', {
            'fields': ('faqs',),
            'description': 'سوالات متداول را به صورت فرمت JSON وارد کنید. نمونه: [{"question": "...", "answer": "..."}]'
        }),
        ('تنظیمات ریپورتاژ آگهی (Sponsored Ad)', {
            'fields': (
                'is_reportage', 'reportage_title', 'reportage_content', 
                'reportage_button_text', 'reportage_button_link', 'reportage_image', 'reportage_badge'
            ),
            'classes': ('collapse',)
        }),
    )
