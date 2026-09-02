import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Check,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  UploadCloud,
  X,
  Layers,
  FileText,
  TrendingUp,
  FolderPlus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Hash,
  Share2,
  RefreshCw,
  Palette,
  Loader2,
  Globe,
  Gauge,
  Zap,
  Sliders,
  ShieldCheck,
  Laptop,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { BlogPost, BlogCategoryItem, DjangoCrmConfig } from '../../types';
import {
  djangoFetchBlogPosts,
  djangoFetchBlogPostBySlug,
  djangoCreateBlogPost,
  djangoUpdateBlogPost,
  djangoDeleteBlogPost,
  djangoFetchBlogCategories,
  djangoCreateBlogCategory,
  djangoDeleteBlogCategory
} from '../../services/djangoApi';
import { formatNumberFa } from '../../utils/formatters';
import { TinyMceEditor } from '../common/TinyMceEditor';

export interface SeoCheckItem {
  id: string;
  title: string;
  status: 'good' | 'ok' | 'bad';
  score: number;
  message: string;
  recommendation?: string;
}

export interface YoastSeoReport {
  overallScore: number;
  status: 'good' | 'ok' | 'bad';
  statusText: string;
  focusKeyword: string;
  titleLength: number;
  metaDescLength: number;
  wordCount: number;
  checks: SeoCheckItem[];
  goodCount: number;
  okCount: number;
  badCount: number;
}

export function calculateYoastSeoAnalysis(post: Partial<BlogPost>): YoastSeoReport {
  const focusKeyword = (post.focusKeyword || '').trim();
  const title = (post.metaTitle || post.title || '').trim();
  const slug = (post.slug || '').trim().toLowerCase();
  const metaDesc = (post.metaDescription || post.excerpt || '').trim();
  const cleanContent = (post.content || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanContent ? cleanContent.split(/\s+/).filter(Boolean).length : 0;
  const introText = cleanContent.slice(0, 300).toLowerCase();

  const checks: SeoCheckItem[] = [];

  // 1. Focus Keyword Definition
  if (!focusKeyword) {
    checks.push({
      id: 'focus_kw_missing',
      title: 'کلمه کلیدی کانونی (Focus Keyphrase)',
      status: 'bad',
      score: 0,
      message: 'کلمه کلیدی کانونی برای این مقاله مشخص نشده است.',
      recommendation: 'یک کلمه یا عبارت کلیدی (مثلاً "خرید عمده سیگار" یا "تحلیل بازار") در فیلد کلمه کلیدی وارد نمایید.'
    });
  } else {
    const kwWords = focusKeyword.split(/\s+/).filter(Boolean).length;
    if (kwWords <= 4) {
      checks.push({
        id: 'focus_kw_ok',
        title: 'کلمه کلیدی کانونی (Focus Keyphrase)',
        status: 'good',
        score: 10,
        message: `کلمه کلیدی کانونی «${focusKeyword}» به درستی تنظیم شده است.`
      });
    } else {
      checks.push({
        id: 'focus_kw_long',
        title: 'طول کلمه کلیدی کانونی',
        status: 'ok',
        score: 6,
        message: `عبارت کلیدی (${kwWords} کلمه) کمی طولانی است. عبارات ۲ تا ۴ کلمه‌ای اثربخشی بالاتری دارند.`
      });
    }
  }

  // 2. Keyword in Title
  if (!focusKeyword) {
    checks.push({
      id: 'kw_in_title_no_kw',
      title: 'کلمه کلیدی در عنوان سئو',
      status: 'bad',
      score: 0,
      message: 'به دلیل عدم تعیین کلمه کلیدی، بررسی عنوان امکان‌پذیر نیست.'
    });
  } else if (title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    checks.push({
      id: 'kw_in_title_good',
      title: 'کلمه کلیدی در عنوان سئو',
      status: 'good',
      score: 10,
      message: 'کلمه کلیدی کانونی دقیقاً در عنوان مقاله درج شده است.'
    });
  } else {
    checks.push({
      id: 'kw_in_title_bad',
      title: 'کلمه کلیدی در عنوان سئو',
      status: 'bad',
      score: 0,
      message: `کلمه کلیدی «${focusKeyword}» در عنوان مقاله یافت نشد.`,
      recommendation: 'کلمه کلیدی را در عنوان اصلی یا عنوان متای سئو قرار دهید.'
    });
  }

  // 3. Keyword Position in Title
  if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    const kwPos = title.toLowerCase().indexOf(focusKeyword.toLowerCase());
    if (kwPos <= 15) {
      checks.push({
        id: 'kw_pos_title_good',
        title: 'موقعیت کلمه کلیدی در عنوان',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی در ابتدای عنوان قرار دارد که بیشترین تاثیر را در رتبه‌بندی گوگل دارد.'
      });
    } else {
      checks.push({
        id: 'kw_pos_title_ok',
        title: 'موقعیت کلمه کلیدی در عنوان',
        status: 'ok',
        score: 6,
        message: 'کلمه کلیدی در انتهای عنوان آمده است؛ انتقال آن به ابتدای عنوان نرخ کلیک (CTR) را افزایش می‌دهد.'
      });
    }
  }

  // 4. SEO Title Length
  const titleLen = title.length;
  if (titleLen >= 35 && titleLen <= 65) {
    checks.push({
      id: 'title_len_good',
      title: 'طول عنوان سئو (SEO Title Length)',
      status: 'good',
      score: 10,
      message: `طول عنوان (${titleLen} کاراکتر) در بازه بهینه گوگل (۳۵ تا ۶۵ کاراکتر) است.`
    });
  } else if (titleLen > 0 && titleLen < 35) {
    checks.push({
      id: 'title_len_short',
      title: 'طول عنوان سئو',
      status: 'ok',
      score: 5,
      message: `عنوان کوتاه است (${titleLen} کاراکتر). برای جلب نظر کاربران، جزئیات جذابتری به آن بیافزایید.`
    });
  } else if (titleLen > 65) {
    checks.push({
      id: 'title_len_long',
      title: 'طول عنوان سئو',
      status: 'bad',
      score: 2,
      message: `عنوان طولانی است (${titleLen} کاراکتر) و در صفحه نتایج گوگل بریده خواهد شد.`
    });
  } else {
    checks.push({
      id: 'title_len_empty',
      title: 'عنوان سئو',
      status: 'bad',
      score: 0,
      message: 'هیچ عنوانی برای مقاله وارد نشده است.'
    });
  }

  // 5. Keyword in Slug
  if (!focusKeyword) {
    checks.push({
      id: 'slug_kw_no_kw',
      title: 'کلمه کلیدی در پیوند یکتا (Slug)',
      status: 'bad',
      score: 0,
      message: 'کلمه کلیدی کانونی برای تطبیق با آدرس URL مشخص نیست.'
    });
  } else {
    const kwClean = focusKeyword.toLowerCase().replace(/\s+/g, '-');
    const kwWords = focusKeyword.toLowerCase().split(/\s+/).filter(Boolean);
    const slugHasKw = slug.includes(kwClean) || kwWords.some(w => w.length > 2 && slug.includes(w));
    if (slugHasKw) {
      checks.push({
        id: 'slug_kw_good',
        title: 'کلمه کلیدی در پیوند یکتا (Slug URL)',
        status: 'good',
        score: 10,
        message: 'پیوند یکتای مقاله شامل کلمه کلیدی کانونی است.'
      });
    } else {
      checks.push({
        id: 'slug_kw_ok',
        title: 'کلمه کلیدی در پیوند یکتا (Slug)',
        status: 'ok',
        score: 5,
        message: 'پیوند یکتا فاقد کلمه کلیدی کانونی است. بهتر است کلمه کلیدی در آدرس مقاله درج شود.'
      });
    }
  }

  // 6. Meta Description Length
  const metaLen = metaDesc.length;
  if (metaLen >= 110 && metaLen <= 160) {
    checks.push({
      id: 'meta_len_good',
      title: 'طول توضیحات متای سئو (Meta Description)',
      status: 'good',
      score: 10,
      message: `طول توضیحات متا (${metaLen} کاراکتر) در محدوده استاندارد نتایج سرپ گوگل (۱۱۰ تا ۱۶۰ کاراکتر) است.`
    });
  } else if (metaLen > 0 && metaLen < 110) {
    checks.push({
      id: 'meta_len_short',
      title: 'طول توضیحات متای سئو',
      status: 'ok',
      score: 5,
      message: `توضیحات متا کوتاه است (${metaLen} کاراکتر). نوشتن یک خلاصه جذاب ۱۱۰ الی ۱۶۰ کاراکتری نرخ کلیک را بالا می‌برد.`
    });
  } else if (metaLen > 160) {
    checks.push({
      id: 'meta_len_long',
      title: 'طول توضیحات متای سئو',
      status: 'bad',
      score: 3,
      message: `توضیحات متا طولانی است (${metaLen} کاراکتر) و انتهای آن در نتایج گوگل بریده می‌شود.`
    });
  } else {
    checks.push({
      id: 'meta_len_empty',
      title: 'توضیحات متای سئو',
      status: 'bad',
      score: 0,
      message: 'توضیحات متای سئو وارد نشده است و گوگل متن تصادفی از صفحه نمایش خواهد داد.'
    });
  }

  // 7. Keyword in Meta Description
  if (focusKeyword && metaDesc) {
    if (metaDesc.toLowerCase().includes(focusKeyword.toLowerCase())) {
      checks.push({
        id: 'kw_in_meta_good',
        title: 'کلمه کلیدی در توضیحات متا',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی در توضیحات متای گوگل درج شده و در نتایج سرچ Bold خواهد شد.'
      });
    } else {
      checks.push({
        id: 'kw_in_meta_bad',
        title: 'کلمه کلیدی در توضیحات متا',
        status: 'bad',
        score: 0,
        message: 'کلمه کلیدی در توضیحات متا درج نشده است.',
        recommendation: 'کلمه کلیدی را در متن توضیحات متای سئو بیاورید.'
      });
    }
  }

  // 8. Keyword in Introduction
  if (focusKeyword && introText) {
    if (introText.includes(focusKeyword.toLowerCase())) {
      checks.push({
        id: 'kw_in_intro_good',
        title: 'کلمه کلیدی در مقدمه و پاراگراف اول',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی کانونی در بخش آغازین متن مقاله آورده شده است.'
      });
    } else {
      checks.push({
        id: 'kw_in_intro_ok',
        title: 'کلمه کلیدی در مقدمه',
        status: 'ok',
        score: 4,
        message: 'کلمه کلیدی در پاراگراف اول مقاله یافت نشد؛ درج آن در خط اول موجب درک سریع‌تر ربات گوگل می‌شود.'
      });
    }
  }

  // 9. Content Word Count
  if (wordCount >= 300) {
    checks.push({
      id: 'content_len_good',
      title: 'حجم و تعداد کلمات محتوا',
      status: 'good',
      score: 10,
      message: `تعداد کلمات (${formatNumberFa(wordCount)} کلمه) عالی است و ارزش محتوایی بالایی برای سئو دارد.`
    });
  } else if (wordCount >= 150) {
    checks.push({
      id: 'content_len_ok',
      title: 'حجم و تعداد کلمات محتوا',
      status: 'ok',
      score: 6,
      message: `تعداد کلمات (${formatNumberFa(wordCount)} کلمه) متوسط است. مقالات جامع‌تر با بیش از ۳۰۰ کلمه رتبه‌های بهتری کسب می‌کنند.`
    });
  } else if (wordCount > 0) {
    checks.push({
      id: 'content_len_bad',
      title: 'حجم و تعداد کلمات محتوا',
      status: 'bad',
      score: 2,
      message: `تعداد کلمات محتوا (${formatNumberFa(wordCount)} کلمه) بسیار کم است (حداقل ۱۵۰ کلمه نیاز است).`
    });
  } else {
    checks.push({
      id: 'content_len_empty',
      title: 'متن اصلی مقاله',
      status: 'bad',
      score: 0,
      message: 'هنوز متنی در ویرایشگر مقاله تایپ نشده است.'
    });
  }

  // 10. Featured Image
  if (post.image) {
    checks.push({
      id: 'img_good',
      title: 'تصویر شاخص با کیفیت',
      status: 'good',
      score: 10,
      message: 'تصویر شاخص بارگذاری شده و باعث جذابیت بصری در نتایج جستجو و شبکه‌های اجتماعی می‌شود.'
    });
  } else {
    checks.push({
      id: 'img_bad',
      title: 'تصویر شاخص مقاله',
      status: 'bad',
      score: 0,
      message: 'تصویر شاخص بارگذاری نشده است.',
      recommendation: 'یک تصویر باکیفیت و متناسب آپلود کنید.'
    });
  }

  // 11. Key Takeaways (Rich Snippets)
  const takeawaysCount = (post.keyTakeaways || []).length;
  if (takeawaysCount >= 2) {
    checks.push({
      id: 'takeaways_good',
      title: 'نکات کلیدی برای Google Rich Snippets',
      status: 'good',
      score: 10,
      message: `تعداد ${formatNumberFa(takeawaysCount)} نکته کلیدی ثبت شده که برای فیچر اسنیپت‌های هوش مصنوعی و گوگل عالی است.`
    });
  } else if (takeawaysCount === 1) {
    checks.push({
      id: 'takeaways_ok',
      title: 'نکات کلیدی مقاله',
      status: 'ok',
      score: 5,
      message: 'تنها ۱ نکته کلیدی ثبت شده است. پیشنهاد می‌شود حداقل ۲ نکته کلیدی اضافه کنید.'
    });
  } else {
    checks.push({
      id: 'takeaways_bad',
      title: 'نکات کلیدی مقاله',
      status: 'bad',
      score: 0,
      message: 'نکات کلیدی ثبت نشده است. این بخش باعث افزایش ماندگاری کاربر در صفحه می‌شود.'
    });
  }

  // 12. Tags
  const tagsCount = (post.tags || []).length;
  if (tagsCount >= 2) {
    checks.push({
      id: 'tags_good',
      title: 'برچسب‌ها و تگ‌های سئو',
      status: 'good',
      score: 10,
      message: `تعداد ${formatNumberFa(tagsCount)} برچسب مرتبط برای دسته‌بندی و پیوند‌های درونی تنظیم شده است.`
    });
  } else if (tagsCount === 1) {
    checks.push({
      id: 'tags_ok',
      title: 'برچسب‌های مقاله',
      status: 'ok',
      score: 5,
      message: 'تنها ۱ برچسب ثبت شده است. حداقل ۲ برچسب پیشنهاد می‌شود.'
    });
  } else {
    checks.push({
      id: 'tags_bad',
      title: 'برچسب‌های مقاله',
      status: 'bad',
      score: 0,
      message: 'هیچ برچسبی برای این مقاله ثبت نشده است.'
    });
  }

  const totalScorePossible = checks.length * 10;
  const totalScoreObtained = checks.reduce((sum, c) => sum + c.score, 0);
  const overallScore = totalScorePossible > 0 ? Math.min(100, Math.round((totalScoreObtained / totalScorePossible) * 100)) : 0;

  let status: 'good' | 'ok' | 'bad' = 'bad';
  let statusText = 'سئو ضعیف (نیازمند بهینه‌سازی فوری)';
  if (overallScore >= 75) {
    status = 'good';
    statusText = 'سئو عالی و کاملاً بهینه‌شده (چراغ سبز Yoast)';
  } else if (overallScore >= 45) {
    status = 'ok';
    statusText = 'سئو متوسط و قابل قبول (چراغ نارنجی Yoast - نیازمند چند بهبود)';
  }

  return {
    overallScore,
    status,
    statusText,
    focusKeyword,
    titleLength: titleLen,
    metaDescLength: metaLen,
    wordCount,
    checks,
    goodCount: checks.filter(c => c.status === 'good').length,
    okCount: checks.filter(c => c.status === 'ok').length,
    badCount: checks.filter(c => c.status === 'bad').length,
  };
}

interface BlogManagementPanelProps {
  crmConfig?: DjangoCrmConfig;
  onOpenBackendModal?: () => void;
  onReturnToDashboard?: () => void;
  onNavigateToPublicBlog?: (slug?: string) => void;
}

export const BlogManagementPanel: React.FC<BlogManagementPanelProps> = ({
  crmConfig,
  onOpenBackendModal,
  onReturnToDashboard,
  onNavigateToPublicBlog
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'editor' | 'categories'>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Editor Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    content: '',
    image: '',
    readTimeMinutes: 5,
    isPublished: true,
    keyTakeaways: ['تحلیل اختصاصی بازار و توزیع بنکداری'],
    tags: ['دخانیات', 'سوین', 'عمده فروشی']
  });

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Tag / Key Takeaway inputs
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');

  // Category Management Form State
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatSlug, setNewCatSlug] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [isCatSlugTouched, setIsCatSlugTouched] = useState<boolean>(false);
  const slugifyCategory = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');
  const [newCatColor, setNewCatColor] = useState<string>('text-blue-600');
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState<boolean>(false);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState<boolean>(false);
  const [isSyncingCategories, setIsSyncingCategories] = useState<boolean>(false);

  // Yoast SEO State
  const [seoSnippetTab, setSeoSnippetTab] = useState<'desktop' | 'mobile'>('desktop');
  const [seoChecklistOpen, setSeoChecklistOpen] = useState<boolean>(true);
  const [seoFilterStatus, setSeoFilterStatus] = useState<'all' | 'good' | 'ok' | 'bad'>('all');

  const currentSeoReport = useMemo(() => {
    return calculateYoastSeoAnalysis(formData);
  }, [formData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPosts, fetchedCats] = await Promise.all([
        djangoFetchBlogPosts(selectedCategory, searchQuery, crmConfig),
        djangoFetchBlogCategories(crmConfig)
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCats);
    } catch (err) {
      console.error('Error loading blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, crmConfig]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handlePurgeAndSyncCategories = async () => {
    setIsSyncingCategories(true);
    try {
      localStorage.removeItem('sovin_django_blog_categories');
      localStorage.removeItem('sevin_v3_blog_categories');
      // Directly fetch latest categories from Django backend API
      const latestCats = await djangoFetchBlogCategories(crmConfig);
      setCategories(latestCats);
      await loadData();
      showNotification(`همگام‌سازی با موفقیت انجام شد (${latestCats.length} دسته‌بندی از سرور جنگو دریافت گردید).`);
    } catch (e) {
      showNotification('خطا در پاکسازی حافظه و دریافت اطلاعات از سرور جنگو.', 'error');
    } finally {
      setIsSyncingCategories(false);
    }
  };

  // Image File Handling
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب کنید.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageFileName(file.name);
      setImageFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      setFormData(prev => ({ ...prev, image: result }));
      showNotification('تصویر شاخص با موفقیت بارگذاری شد.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setImageFileName('');
    setImageFileSize('');
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open Create Form
  const handleOpenCreateForm = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setImagePreview('');
    setImageFileName('');
    setImageFileSize('');
    setFormData({
      title: '',
      slug: '',
      category: categories.length > 0 && categories[0].id !== 'all' ? categories[0].name : 'تحلیل بازار و ارز',
      excerpt: '',
      content: '<p>متن کامل و تخصصی مقاله را اینجا وارد نمایید...</p>',
      image: '',
      readTimeMinutes: 5,
      isPublished: true,
      focusKeyword: '',
      metaTitle: '',
      metaDescription: '',
      keyTakeaways: ['تحلیل چسبندگی قیمت بازار به نرخ ارز'],
      tags: ['دخانیات', 'سوین']
    });
    setActiveTab('editor');
  };

  // Open Edit Form
  const handleOpenEditForm = async (post: BlogPost) => {
    setIsEditing(true);
    setEditingPostId(post.id);
    setImagePreview(post.image || '');
    setImageFileName('تصویر بارگذاری شده قبلی');
    setImageFileSize('');
    setFormData({ ...post });
    setActiveTab('editor');

    // فهرست مقالات (/blog/list/) فیلد content را برنمی‌گرداند؛ برای جلوگیری از پاک شدن متن مقاله
    // هنگام ذخیره، متن کامل باید از اندپوینت جزئیات (/blog/detail/{slug}/) دوباره دریافت شود
    try {
      const fullPost = await djangoFetchBlogPostBySlug(post.slug, crmConfig);
      if (fullPost && fullPost.id === post.id) {
        setFormData(prev => ({
          ...prev,
          content: fullPost.content || prev.content,
          keyTakeaways: fullPost.keyTakeaways?.length ? fullPost.keyTakeaways : prev.keyTakeaways,
          tags: fullPost.tags?.length ? fullPost.tags : prev.tags,
          faqs: fullPost.faqs?.length ? fullPost.faqs : prev.faqs,
          focusKeyword: fullPost.focusKeyword || post.focusKeyword || prev.focusKeyword || '',
          metaTitle: fullPost.metaTitle || post.metaTitle || prev.metaTitle || '',
          metaDescription: fullPost.metaDescription || post.metaDescription || prev.metaDescription || ''
        }));
      }
    } catch (err) {
      showNotification('خطا در دریافت متن کامل مقاله از سرور.', 'error');
    }
  };

  // Handle Title & Auto Slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '');
    setFormData(prev => ({
      ...prev,
      title,
      slug: isEditing && prev.slug ? prev.slug : slug
    }));
  };

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const curTags = formData.tags || [];
    if (!curTags.includes(newTagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...curTags, newTagInput.trim()] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  // Add Key Takeaway
  const handleAddTakeaway = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newTakeawayInput.trim()) return;
    const cur = formData.keyTakeaways || [];
    setFormData(prev => ({ ...prev, keyTakeaways: [...cur, newTakeawayInput.trim()] }));
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      keyTakeaways: (prev.keyTakeaways || []).filter((_, i) => i !== idx)
    }));
  };

  // Submit Article Form
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showNotification('لطفاً عنوان مقاله را وارد کنید.', 'error');
      return;
    }
    if (!formData.content?.trim()) {
      showNotification('لطفاً متن اصلی مقاله را در ویرایشگر وارد کنید.', 'error');
      return;
    }
    if (!formData.image) {
      showNotification('لطفاً یک تصویر شاخص برای مقاله بارگذاری کنید.', 'error');
      return;
    }

    setIsSubmittingArticle(true);
    try {
      if (isEditing && editingPostId) {
        await djangoUpdateBlogPost(editingPostId, formData, crmConfig);
        showNotification('مقاله با موفقیت در دیتابیس بروزرسانی شد.');
      } else {
        await djangoCreateBlogPost(formData, crmConfig);
        showNotification('مقاله جدید با تاریخ خودکار سرور با موفقیت ثبت گردید.');
      }
      await loadData();
      setActiveTab('posts');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'خطا در ثبت اطلاعات در سرور.', 'error');
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  // Delete Article
  const handleDeletePost = async (id: string) => {
    if (!window.confirm('آیا از حذف کامل این مقاله اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
      return;
    }
    try {
      await djangoDeleteBlogPost(id, crmConfig);
      showNotification('مقاله مورد نظر با موفقیت حذف گردید.');
      await loadData();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'خطا در حذف مقاله.', 'error');
    }
  };

  // Add Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showNotification('لطفاً نام دسته‌بندی را وارد کنید.', 'error');
      return;
    }

    setIsSubmittingCategory(true);
    try {
      await djangoCreateBlogCategory({
        name: newCatName.trim(),
        slug: newCatSlug.trim() || undefined,
        description: newCatDesc.trim(),
        color: newCatColor
      }, crmConfig);
      showNotification(`دسته‌بندی «${newCatName}» با موفقیت در دیتابیس جنگو ثبت شد.`);
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      setIsCatSlugTouched(false);
      setIsAddingCategory(false);
      await loadData();
    } catch (err) {
      showNotification('خطا در ایجاد دسته‌بندی در سرور.', 'error');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (catId === 'all') {
      showNotification('امکان حذف دسته‌بندی پیش‌فرض سیستم وجود ندارد.', 'error');
      return;
    }
    if (!window.confirm(`آیا از حذف دسته‌بندی «${catName}» اطمینان دارید؟`)) {
      return;
    }

    try {
      await djangoDeleteBlogCategory(catId, crmConfig);
      showNotification(`دسته‌بندی «${catName}» با موفقیت حذف شد.`);
      await loadData();
    } catch (err) {
      showNotification('خطا در حذف دسته‌بندی.', 'error');
    }
  };

  // Calculations
  const totalArticles = posts.length;
  const publishedArticles = posts.filter(p => p.isPublished).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const activeCategoriesCount = categories.filter(c => c.id !== 'all').length;

  return (
    <div className="w-full min-h-screen bg-slate-50/80 text-slate-900 font-sans pb-16">
      
      {/* TOP HEADER BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  مدیریت مقالات و وبلاگ تخصصی
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                  Django CMS Engine
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                تولید محتوا، درج تصاویر شاخص، ویرایشگر TinyMCE و مدیریت دسته‌بندی‌های وبلاگ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="px-3 sm:px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به صندوق</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onNavigateToPublicBlog) {
                  onNavigateToPublicBlog();
                } else {
                  window.location.href = '/blog';
                }
              }}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              <span>مشاهده وبلاگ عمومی</span>
            </button>

            {activeTab !== 'editor' && (
              <button
                type="button"
                onClick={handleOpenCreateForm}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 sm:gap-2 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن مقاله جدید</span>
              </button>
            )}
          </div>

        </div>

        {/* SUB NAVIGATION TABS */}
        <div className="w-full px-3 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>فهرست مقالات</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(totalArticles)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 sm:px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مدیریت دسته‌بندی‌ها</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
              {formatNumberFa(activeCategoriesCount)}
            </span>
          </button>

          {activeTab === 'editor' && (
            <button
              type="button"
              className="py-3 px-3 sm:px-4 text-xs font-black border-b-2 border-amber-600 text-amber-600 flex items-center gap-2 whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'ویرایش مقاله' : 'نگارش مقاله جدید'}</span>
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="w-full px-3 sm:px-6 lg:px-8 pt-4">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="w-full px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">

        {/* ======================================================== */}
        {/* VIEW 1: POSTS LIST TAB */}
        {/* ======================================================== */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500 font-bold truncate">کل مقالات ثبت شده</div>
                  <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
                    {formatNumberFa(totalArticles)} <span className="text-xs font-normal text-slate-500">مقاله</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500 font-bold truncate">منتشر شده در وبلاگ</div>
                  <div className="text-sm sm:text-base md:text-lg font-black text-emerald-600 mt-0.5">
                    {formatNumberFa(publishedArticles)} <span className="text-xs font-normal text-slate-500">پست</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500 font-bold truncate">مجموع بازدیدها</div>
                  <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
                    {formatNumberFa(totalViews)} <span className="text-xs font-normal text-slate-500">بازدید</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500 font-bold truncate">دسته‌بندی‌های فعال</div>
                  <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 mt-0.5">
                    {formatNumberFa(activeCategoriesCount)} <span className="text-xs font-normal text-slate-500">دسته</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER & SEARCH TOOLBAR */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجو در عنوان، متن یا برچسب مقاله..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-10 pl-8 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap ml-1 shrink-0">دسته‌بندی:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all' || !selectedCategory
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  همه مقالات
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      selectedCategory === cat.name || selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

            </div>

            {/* ARTICLES TABLE / LIST (DESKTOP & MOBILE RESPONSIVE) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 text-xs font-bold flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>در حال دریافت لیست مقالات از سرور جنگو...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 sm:p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800">هیچ مقاله‌ای یافت نشد</h3>
                    <p className="text-xs text-slate-500">
                      می‌توانید با کلیک روی دکمه زیر، اولین مقاله تخصصی وبلاگ را ثبت کنید.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateForm}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن مقاله جدید</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* DESKTOP / TABLET VIEW (TABLE) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-black">
                          <th className="p-4 w-12 text-center">#</th>
                          <th className="p-4">تصویر شاخص و عنوان مقاله</th>
                          <th className="p-4">دسته‌بندی</th>
                          <th className="p-4">تاریخ انتشار (خودکار جنگو)</th>
                          <th className="p-4">زمان مطالعه</th>
                          <th className="p-4 text-center">نمره سئو (Yoast)</th>
                          <th className="p-4">وضعیت</th>
                          <th className="p-4">بازدید</th>
                          <th className="p-4 text-center">عملیات مدیریت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {posts.map((post, idx) => (
                          <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Index */}
                            <td className="p-4 text-center text-slate-400 font-bold">
                              {formatNumberFa(idx + 1)}
                            </td>

                            {/* Image & Title */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-xs relative">
                                  {post.image ? (
                                    <img
                                      src={post.image}
                                      alt={post.title}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <ImageIcon className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-0.5 max-w-lg">
                                  <div className="font-black text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                                    {post.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 line-clamp-1">
                                    {post.excerpt || 'بدون چکیده مختصر'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-4">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 inline-block">
                                {post.category}
                              </span>
                            </td>

                            {/* Published Date (Auto-set by Django) */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-mono">{post.publishedDate}</span>
                              </div>
                            </td>

                            {/* Read Time */}
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-slate-600 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatNumberFa(post.readTimeMinutes || 5)} دقیقه</span>
                              </div>
                            </td>

                            {/* Yoast SEO Score */}
                            <td className="p-4 text-center">
                              {(() => {
                                const seo = calculateYoastSeoAnalysis(post);
                                const badgeColor = seo.status === 'good'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : seo.status === 'ok'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200';
                                const dotColor = seo.status === 'good' ? 'bg-emerald-500' : seo.status === 'ok' ? 'bg-amber-500' : 'bg-red-500';
                                return (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${badgeColor}`} title={seo.statusText}>
                                    <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                                    <span>{formatNumberFa(seo.overallScore)}٪</span>
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              {post.isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  منتشر شده
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                                  پیش‌نویس
                                </span>
                              )}
                            </td>

                            {/* Views */}
                            <td className="p-4 font-bold text-slate-700">
                              {formatNumberFa(post.viewsCount || 0)}
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onNavigateToPublicBlog) {
                                      onNavigateToPublicBlog(post.slug);
                                    } else {
                                      window.location.href = `/blog/${post.slug}`;
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                                  title="مشاهده در وبلاگ عمومی"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(post)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors"
                                  title="ویرایش مقاله"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                                  title="حذف مقاله"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE RESPONSIVE CARDS VIEW (< md) */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {posts.map((post, idx) => (
                      <div key={post.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400 font-bold">#{formatNumberFa(idx + 1)}</span>
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const seo = calculateYoastSeoAnalysis(post);
                                  const badgeColor = seo.status === 'good'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : seo.status === 'ok'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200';
                                  const dotColor = seo.status === 'good' ? 'bg-emerald-500' : seo.status === 'ok' ? 'bg-amber-500' : 'bg-red-500';
                                  return (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${badgeColor}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                      <span>سئو: {formatNumberFa(seo.overallScore)}٪</span>
                                    </span>
                                  );
                                })()}
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                              {post.title}
                            </h4>
                          </div>
                        </div>

                        {post.excerpt && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {post.publishedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {formatNumberFa(post.viewsCount || 0)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToPublicBlog) {
                                  onNavigateToPublicBlog(post.slug);
                                } else {
                                  window.location.href = `/blog/${post.slug}`;
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                              <span>مشاهده</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(post)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>ویرایش</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: CREATE / EDIT ARTICLE TAB (WITH TINYMCE & UPLOAD) */}
        {/* ======================================================== */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmitArticle} className="space-y-6">
            
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {isEditing ? 'ویرایش مقاله تخصصی' : 'نگارش و ثبت مقاله جدید'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    محتوای تولید شده مستقیماً با پایگاه داده جنگو (Django REST Framework) همگام‌سازی می‌شود.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('posts')}
                  disabled={isSubmittingArticle}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingArticle}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmittingArticle ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {isSubmittingArticle
                      ? (isEditing ? 'در حال ذخیره تغییرات...' : 'در حال ثبت در دیتابیس...')
                      : (isEditing ? 'ذخیره تغییرات مقاله' : 'ثبت نهایی مقاله')}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* MAIN FORM COLUMN (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Title & Slug */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      عنوان اصلی مقاله: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={handleTitleChange}
                      placeholder="مثلاً: تحلیل چسبندگی نرخ کارتن سیگار به دلار آزاد و درهم"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      پیوند یکتا (Slug URL):
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-slug-example"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      آدرس دسترسی در وبلاگ: /blog/{formData.slug || 'url-slug'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1.5">
                      خلاصه و چکیده مقاله (Excerpt):
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="توضیح کوتاه و جذاب ۲ الی ۳ خطی برای نمایش در کارت‌های وبلاگ..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>
                </div>

                {/* TINYMCE RICH TEXT WYSIWYG EDITOR */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>متن اصلی مقاله (ویرایشگر بصری TinyMCE):</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      امکان درج تیترها، جدول، نقل‌قول و لینک
                    </span>
                  </div>

                  <TinyMceEditor
                    value={formData.content || ''}
                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    onWordCountChange={(words, readTime) => {
                      setFormData(prev => ({ ...prev, readTimeMinutes: readTime }));
                    }}
                    placeholder="متن کامل و تخصصی مقاله را اینجا بدون نیاز به تایپ تگ‌های HTML بنویسید..."
                    minHeight="380px"
                  />
                </div>

                {/* KEY TAKEAWAYS & BULLETS */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    نکات کلیدی و چکیده محتوا (Key Takeaways):
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTakeawayInput}
                      onChange={(e) => setNewTakeawayInput(e.target.value)}
                      onKeyDown={handleAddTakeaway}
                      placeholder="یک نکته کلیدی تایپ کنید و Enter بزنید..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTakeaway}
                      className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                    >
                      افزودن نکته
                    </button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {(formData.keyTakeaways || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* YOAST SEO ANALYSIS & GOOGLE SERP PREVIEW BOX */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  
                  {/* SEO Card Header with Live Score Gauge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                          <span>آنالیز هوشمند سئو و پیش‌نمایش گوگل (Yoast SEO)</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                            استاندارد ۲۰۲۶
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          بررسی لحظه‌ای فاکتورهای الگوریتم رتبه‌بندی گوگل و غنای محتوا
                        </p>
                      </div>
                    </div>

                    {/* Live Score Badge */}
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
                      currentSeoReport.status === 'good'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                        : currentSeoReport.status === 'ok'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                        : 'bg-red-50/80 border-red-200 text-red-800'
                    }`}>
                      <div className="text-right">
                        <div className="text-[10px] font-bold opacity-80">درجه سئو مقاله</div>
                        <div className="text-xs font-black">
                          {currentSeoReport.status === 'good' ? '🟢 عالی (سبز)' : currentSeoReport.status === 'ok' ? '🟠 متوسط (نارنجی)' : '🔴 ضعیف (قرمز)'}
                        </div>
                      </div>
                      <div className="text-lg font-black font-mono border-r pr-3 border-current/20">
                        {formatNumberFa(currentSeoReport.overallScore)}<span className="text-xs font-normal">/۱۰۰</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Keyphrase Field */}
                  <div className="space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span>کلمه کلیدی کانونی (Focus Keyphrase):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        واژه‌ای که می‌خواهید مقاله در رتبه ۱ گوگل قرار گیرد
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeyword || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                      placeholder="مثلاً: خرید عمده سیگار یا قیمت کارتن سیگار"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* GOOGLE SERP PREVIEW BOX */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-slate-600" />
                        <span>پیش‌نمایش در صفحه اول نتایج جستجوی گوگل (Google Snippet):</span>
                      </label>

                      {/* Device Toggle */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setSeoSnippetTab('desktop')}
                          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                            seoSnippetTab === 'desktop'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Laptop className="w-3.5 h-3.5" />
                          <span>دسکتاپ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSeoSnippetTab('mobile')}
                          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                            seoSnippetTab === 'mobile'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>موبایل</span>
                        </button>
                      </div>
                    </div>

                    {/* Snippet Card */}
                    <div className={`border border-slate-200 rounded-2xl bg-white p-4 shadow-xs transition-all ${
                      seoSnippetTab === 'mobile' ? 'max-w-md mx-auto ring-4 ring-slate-100' : 'w-full'
                    }`}>
                      {/* Domain Breadcrumb */}
                      <div className="flex items-center gap-2 mb-1 text-slate-800 text-[11px]" dir="ltr">
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 text-[9px] font-bold">
                          S
                        </div>
                        <div className="min-w-0 truncate text-slate-700 font-sans">
                          <span className="font-semibold text-slate-900">sevin-tobacco.ir</span>
                          <span className="text-slate-400"> › blog › {formData.slug || 'slug-url'}</span>
                        </div>
                      </div>

                      {/* Blue Link Heading */}
                      <div className="mt-1">
                        <h4 className="text-sm sm:text-base font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                          {formData.metaTitle || formData.title || 'عنوان مقاله شما در نتایج جستجوی گوگل'}
                        </h4>
                      </div>

                      {/* Snippet Description */}
                      <div className="mt-1.5 text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                        <span className="text-slate-400 font-mono text-[11px] ml-1.5">
                          {formData.publishedDate || 'امروز'} —
                        </span>
                        <span>
                          {formData.metaDescription || formData.excerpt || 'توضیحات متای این مقاله در اینجا نمایش داده خواهد شد تا کاربر ترغیب به کلیک روی لینک وبسایت شما شود...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Meta Title & Meta Description Inputs with Character Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* SEO Meta Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-slate-700">
                          عنوان متای سئو (Meta Title):
                        </label>
                        <span className={`text-[10px] font-bold ${
                          currentSeoReport.titleLength >= 35 && currentSeoReport.titleLength <= 65
                            ? 'text-emerald-600'
                            : currentSeoReport.titleLength > 65
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                          {formatNumberFa(currentSeoReport.titleLength)} / ۶۵ کاراکتر
                        </span>
                      </div>

                      <input
                        type="text"
                        value={formData.metaTitle || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder={formData.title || 'عنوان متای بهینه‌شده برای موتور جستجو...'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                      />

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            currentSeoReport.titleLength >= 35 && currentSeoReport.titleLength <= 65
                              ? 'bg-emerald-500'
                              : currentSeoReport.titleLength > 65
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (currentSeoReport.titleLength / 65) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        در صورت خالی بودن، از عنوان اصلی مقاله استفاده می‌شود. (طول ایده‌آل: ۳۵ تا ۶۵ کاراکتر)
                      </p>
                    </div>

                    {/* SEO Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-slate-700">
                          توضیحات متای سئو (Meta Description):
                        </label>
                        <span className={`text-[10px] font-bold ${
                          currentSeoReport.metaDescLength >= 110 && currentSeoReport.metaDescLength <= 160
                            ? 'text-emerald-600'
                            : currentSeoReport.metaDescLength > 160
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                          {formatNumberFa(currentSeoReport.metaDescLength)} / ۱۶۰ کاراکتر
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={formData.metaDescription || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder={formData.excerpt || 'توضیحات متا جذاب برای جذب کلیک در صفحه اول گوگل...'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed"
                      />

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            currentSeoReport.metaDescLength >= 110 && currentSeoReport.metaDescLength <= 160
                              ? 'bg-emerald-500'
                              : currentSeoReport.metaDescLength > 160
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (currentSeoReport.metaDescLength / 160) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        در صورت خالی بودن، از چکیده مقاله استفاده خواهد شد. (طول ایده‌آل: ۱۱۰ تا ۱۶۰ کاراکتر)
                      </p>
                    </div>

                  </div>

                  {/* YOAST SEO INTERACTIVE CHECKLIST ACCORDION */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-black text-slate-800">
                          چک‌لیست تحلیلی سئو به سبک Yoast SEO ({formatNumberFa(currentSeoReport.checks.length)} فاکتور)
                        </span>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSeoFilterStatus('all')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            seoFilterStatus === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          همه ({formatNumberFa(currentSeoReport.checks.length)})
                        </button>

                        <button
                          type="button"
                          onClick={() => setSeoFilterStatus('good')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            seoFilterStatus === 'good'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>سبز ({formatNumberFa(currentSeoReport.goodCount)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSeoFilterStatus('ok')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            seoFilterStatus === 'ok'
                              ? 'bg-amber-600 text-white'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>نارنجی ({formatNumberFa(currentSeoReport.okCount)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSeoFilterStatus('bad')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                            seoFilterStatus === 'bad'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-50 hover:bg-red-100 text-red-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>قرمز ({formatNumberFa(currentSeoReport.badCount)})</span>
                        </button>
                      </div>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                      {currentSeoReport.checks
                        .filter(c => seoFilterStatus === 'all' || c.status === seoFilterStatus)
                        .map((check) => {
                          const dotColor = check.status === 'good' ? 'bg-emerald-500' : check.status === 'ok' ? 'bg-amber-500' : 'bg-red-500';
                          const bgCard = check.status === 'good' ? 'bg-emerald-50/40 border-emerald-200/60' : check.status === 'ok' ? 'bg-amber-50/40 border-amber-200/60' : 'bg-red-50/40 border-red-200/60';
                          return (
                            <div key={check.id} className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${bgCard}`}>
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 mt-1 shadow-xs`}></span>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="font-black text-slate-800 text-[11px] flex items-center justify-between">
                                  <span>{check.title}</span>
                                  <span className="text-[10px] font-mono opacity-60">+{formatNumberFa(check.score)} امتیاز</span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {check.message}
                                </p>
                                {check.recommendation && (
                                  <p className="text-blue-700 text-[10px] font-bold pt-0.5">
                                    💡 پیشنهاد: {check.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                </div>

              </div>

              {/* SIDEBAR SETTINGS COLUMN (1 Col) */}
              <div className="space-y-6">
                
                {/* FEATURED IMAGE UPLOAD (FILE UPLOAD ONLY - NO SAMPLES) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    تصویر شاخص مقاله (آپلود عکس): <span className="text-red-500">*</span>
                  </label>

                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-100">
                        <img
                          src={imagePreview}
                          alt="Featured Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 left-2 p-1.5 rounded-xl bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                          title="حذف و تعویض تصویر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                        <span className="font-bold truncate">{imageFileName || 'تصویر شاخص'}</span>
                        <span className="text-slate-400 text-[10px]">{imageFileSize}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="w-4 h-4 text-slate-600" />
                        <span>انتخاب تصویر دیگر</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-black text-slate-800">
                        کلیک یا کشیدن و رها کردن تصویر
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        فرمت‌های JPG، PNG و WebP تا سقف ۵ مگابایت
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* PUBLISH DATE (DJANGO AUTO-GENERATED BADGE) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>تاریخ و زمان انتشار:</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                      Django auto_now_add
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-500">تاریخ ثبت در دیتابیس:</span>
                      <span className="font-mono text-slate-900">{formData.publishedDate || 'ثبت خودکار لحظه‌ای'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60">
                      تاریخ انتشار همانند جنگو به طور کاملاً خودکار بر اساس زمان ذخیره‌سازی سرور تنظیم می‌گردد و نیازی به ورود دستی ندارد.
                    </p>
                  </div>
                </div>

                {/* CATEGORY SELECT */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900">
                      دسته‌بندی مقاله:
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      + ساخت دسته جدید
                    </button>
                  </div>

                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {categories.length === 0 ? (
                      <option value="">(هنوز دسته‌ای ایجاد نشده است - لطفاً دسته جدید بسازید)</option>
                    ) : (
                      <>
                        <option value="">-- انتخاب دسته‌بندی --</option>
                        {categories.filter(c => c.id !== 'all').map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* TAGS (CHIPS INPUT) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    برچسب‌ها و تگ‌های مقاله:
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="برچسب جدید و کلید اینتر..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(formData.tags || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
                      >
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-400 hover:text-red-600 mr-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* PUBLISH TOGGLE */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <label className="block text-xs font-black text-slate-900">
                    وضعیت انتشار در وبلاگ:
                  </label>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-800">انتشار عمومی</div>
                      <div className="text-[10px] text-slate-400">نمایش در سایت و صفحه وبلاگ</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished !== false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* BOTTOM SUBMIT BUTTON */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    disabled={isSubmittingArticle}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingArticle}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmittingArticle ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      {isSubmittingArticle
                        ? (isEditing ? 'در حال ذخیره تغییرات...' : 'در حال ثبت در دیتابیس...')
                        : (isEditing ? 'ذخیره تغییرات مقاله' : 'ثبت نهایی مقاله')}
                    </span>
                  </button>
                </div>

              </div>

            </div>

          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: CATEGORIES MANAGEMENT TAB (DEDICATED SECTION) */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>مدیریت و ساخت دسته‌بندی‌های وبلاگ</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  دسته‌بندی‌های جدید بسازید تا مستقیماً در دیتابیس جنگو ثبت شوند و در فیلترها و در زمان نوشتن مقالات نمایش داده شوند.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePurgeAndSyncCategories}
                  disabled={isSyncingCategories}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  title="پاکسازی حافظه موقت و بازخوانی تازه از دیتابیس جنگو"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCategories ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                  <span>{isSyncingCategories ? 'در حال همگام‌سازی...' : 'همگام‌سازی از سرور'}</span>
                </button>

                {!isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>ایجاد دسته جدید</span>
                  </button>
                )}
              </div>
            </div>

            {/* CREATE CATEGORY FORM */}
            {isAddingCategory && (
              <form onSubmit={handleCreateCategory} className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>مشخصات دسته‌بندی جدید (ثبت در دیتابیس جنگو)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      عنوان دسته‌بندی: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!isCatSlugTouched) {
                          setNewCatSlug(slugifyCategory(e.target.value));
                        }
                      }}
                      placeholder="مثلاً: اخبار و مصاحبه‌های بازار"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      پیوند یکتا (Slug):
                    </label>
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => {
                        setIsCatSlugTouched(true);
                        setNewCatSlug(e.target.value);
                      }}
                      placeholder="market-news"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    توضیحات کوتاه این دسته:
                  </label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="توضیح مختصر درباره مقالات این دسته‌بندی..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    disabled={isSubmittingCategory}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCategory}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmittingCategory ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                    <span>{isSubmittingCategory ? 'در حال ثبت در دیتابیس...' : 'ایجاد و ثبت در دیتابیس'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* CATEGORIES GRID LIST */}
            {categories.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800">هیچ دسته‌بندی در دیتابیس ثبت نشده است</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    در حال حاضر دسته‌بندی در دیتابیس ثبت نشده است. می‌توانید با کلیک بر روی دکمه زیر دسته‌بندی‌های مد نظر خود را ایجاد نمایید تا مستقیماً به دیتابیس جنگو ارسال شوند.
                  </p>
                </div>
                {!isAddingCategory && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>ایجاد اولین دسته‌بندی در دیتابیس جنگو</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const articleCount = posts.filter(p => p.category === cat.name || cat.id === 'all').length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/80">
                            {cat.name}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {formatNumberFa(articleCount)} مقاله
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 font-medium line-clamp-2 min-h-[36px]">
                          {cat.description || 'بدون توضیحات اضافی'}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                          slug: {cat.slug || cat.id}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setActiveTab('posts');
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>مشاهده مقالات این دسته</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف دسته‌بندی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
