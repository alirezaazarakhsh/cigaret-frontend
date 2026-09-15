import { CigaretteProduct } from '../../types';
import { formatNumberFa } from '../../utils/formatters';

export interface ProductSeoCheckItem {
  id: string;
  title: string;
  status: 'good' | 'ok' | 'bad';
  score: number;
  message: string;
  recommendation?: string;
}

export interface ProductYoastSeoReport {
  overallScore: number;
  status: 'good' | 'ok' | 'bad';
  statusText: string;
  focusKeyword: string;
  titleLength: number;
  metaDescLength: number;
  wordCount: number;
  checks: ProductSeoCheckItem[];
  goodCount: number;
  okCount: number;
  badCount: number;
}

export function calculateProductYoastSeo(product: Partial<CigaretteProduct>): ProductYoastSeoReport {
  const focusKeyword = (product.focusKeyword || '').trim();
  const title = (product.metaTitle || product.nameFa || '').trim();
  const slug = (product.slug || '').trim().toLowerCase();
  const metaDesc = (product.metaDescription || product.excerpt || '').trim();
  const cleanContent = (product.description || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanContent ? cleanContent.split(/\s+/).filter(Boolean).length : 0;
  const introText = cleanContent.slice(0, 300).toLowerCase();

  const checks: ProductSeoCheckItem[] = [];

  // 1. Focus Keyword Definition
  if (!focusKeyword) {
    checks.push({
      id: 'focus_kw_missing',
      title: 'کلمه کلیدی کانونی محصول (Focus Keyphrase)',
      status: 'bad',
      score: 0,
      message: 'کلمه کلیدی کانونی برای این محصول مشخص نشده است.',
      recommendation: 'یک عبارت کلیدی تجاری (مثلاً: «خرید عمده سیگار وینستون لایت اصل») در فیلد کلمه کلیدی وارد کنید.'
    });
  } else {
    const kwWords = focusKeyword.split(/\s+/).filter(Boolean).length;
    if (kwWords <= 5) {
      checks.push({
        id: 'focus_kw_ok',
        title: 'کلمه کلیدی کانونی محصول (Focus Keyphrase)',
        status: 'good',
        score: 10,
        message: `کلمه کلیدی «${focusKeyword}» به درستی تنظیم شده و پتانسیل بالایی برای سرچ خریداران عمده دارد.`
      });
    } else {
      checks.push({
        id: 'focus_kw_long',
        title: 'طول کلمه کلیدی کانونی',
        status: 'ok',
        score: 6,
        message: `عبارت کلیدی (${kwWords} کلمه) کمی طولانی است. عبارات ۲ تا ۴ کلمه‌ای جستجوی بالاتری دارند.`
      });
    }
  }

  // 2. Keyword in Product / SEO Title
  if (!focusKeyword) {
    checks.push({
      id: 'kw_in_title_no_kw',
      title: 'کلمه کلیدی در عنوان محصول',
      status: 'bad',
      score: 0,
      message: 'به دلیل عدم تعیین کلمه کلیدی، بررسی عنوان امکان‌پذیر نیست.'
    });
  } else if (title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    checks.push({
      id: 'kw_in_title_good',
      title: 'کلمه کلیدی در عنوان سئو محصول',
      status: 'good',
      score: 10,
      message: 'کلمه کلیدی کانونی دقیقاً در عنوان محصول درج شده است.'
    });
  } else {
    checks.push({
      id: 'kw_in_title_bad',
      title: 'کلمه کلیدی در عنوان سئو محصول',
      status: 'bad',
      score: 0,
      message: `کلمه کلیدی «${focusKeyword}» در عنوان محصول یافت نشد.`,
      recommendation: 'کلمه کلیدی را در عنوان فارسی یا عنوان متای سئو قرار دهید.'
    });
  }

  // 3. Keyword Position in Title
  if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
    const kwPos = title.toLowerCase().indexOf(focusKeyword.toLowerCase());
    if (kwPos <= 15) {
      checks.push({
        id: 'kw_pos_title_good',
        title: 'موقعیت کلمه کلیدی در ابتدای عنوان',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی در ابتدای عنوان قرار دارد که بیشترین تاثیر را در رتبه‌بندی گوگل و جلب کلیک دارد.'
      });
    } else {
      checks.push({
        id: 'kw_pos_title_ok',
        title: 'موقعیت کلمه کلیدی در عنوان',
        status: 'ok',
        score: 6,
        message: 'کلمه کلیدی در انتهای عنوان آمده است؛ آوردن آن به ابتدای نام محصول توصیه می‌شود.'
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
      message: `عنوان کوتاه است (${titleLen} کاراکتر). نام برند، تیپ بسته‌بندی یا مشخصه اصلی کالا را به آن اضافه کنید.`
    });
  } else if (titleLen > 65) {
    checks.push({
      id: 'title_len_long',
      title: 'طول عنوان سئو',
      status: 'bad',
      score: 2,
      message: `عنوان طولانی است (${titleLen} کاراکتر) و انتهای آن در نتایج جستجوی گوگل بریده خواهد شد.`
    });
  } else {
    checks.push({
      id: 'title_len_empty',
      title: 'عنوان محصول',
      status: 'bad',
      score: 0,
      message: 'نام کالا یا عنوان سئو مشخص نشده است.'
    });
  }

  // 5. Keyword in Slug URL
  if (!focusKeyword) {
    checks.push({
      id: 'slug_kw_no_kw',
      title: 'کلمه کلیدی در پیوند یکتا (Slug URL)',
      status: 'bad',
      score: 0,
      message: 'کلمه کلیدی برای تطبیق با آدرس URL مشخص نیست.'
    });
  } else {
    const kwClean = focusKeyword.toLowerCase().replace(/\s+/g, '-');
    const kwWords = focusKeyword.toLowerCase().split(/\s+/).filter(Boolean);
    const slugHasKw = slug.includes(kwClean) || kwWords.some(w => w.length > 2 && slug.includes(w));
    if (slugHasKw) {
      checks.push({
        id: 'slug_kw_good',
        title: 'کلمه کلیدی در آدرس پیوند یکتا (Slug)',
        status: 'good',
        score: 10,
        message: 'آدرس اینترنتی صفحه محصول شامل عبارت کلیدی یا معادل انگلیسی آن است.'
      });
    } else {
      checks.push({
        id: 'slug_kw_ok',
        title: 'کلمه کلیدی در پیوند یکتا (Slug)',
        status: 'ok',
        score: 5,
        message: 'پیوند یکتا فاقد کلمه کلیدی است. پیشنهاد می‌شود نام انگلیسی یا کلیدواژه را در Slug قرار دهید.'
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
      message: `توضیحات متا کوتاه است (${metaLen} کاراکتر). خلاصه جذاب از شرایط فروش عمده و اصالت کالا اضافه کنید.`
    });
  } else if (metaLen > 160) {
    checks.push({
      id: 'meta_len_long',
      title: 'طول توضیحات متای سئو',
      status: 'bad',
      score: 3,
      message: `توضیحات متا طولانی است (${metaLen} کاراکتر) و در نتایج موبایل یا دسکتاپ خلاصه خواهد شد.`
    });
  } else {
    checks.push({
      id: 'meta_len_empty',
      title: 'توضیحات متای سئو',
      status: 'bad',
      score: 0,
      message: 'توضیحات متای سئو وارد نشده است و گوگل متن تصادفی از صفحه کالا را نشان خواهد داد.'
    });
  }

  // 7. Keyword in Meta Description
  if (focusKeyword && metaDesc) {
    if (metaDesc.toLowerCase().includes(focusKeyword.toLowerCase())) {
      checks.push({
        id: 'kw_in_meta_good',
        title: 'کلمه کلیدی در توضیحات متای سئو',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی در توضیحات متا درج شده و در نتایج گوگل به صورت برجسته (Bold) دیده می‌شود.'
      });
    } else {
      checks.push({
        id: 'kw_in_meta_bad',
        title: 'کلمه کلیدی در توضیحات متا',
        status: 'bad',
        score: 0,
        message: 'کلمه کلیدی در متن توضیحات متای سئو وجود ندارد.',
        recommendation: 'کلمه کلیدی را یک‌بار در توضیحات متای محصول بیاورید.'
      });
    }
  }

  // 8. Keyword in Content / Description
  if (focusKeyword && (introText || cleanContent)) {
    if (introText.includes(focusKeyword.toLowerCase()) || cleanContent.toLowerCase().includes(focusKeyword.toLowerCase())) {
      checks.push({
        id: 'kw_in_content_good',
        title: 'کلمه کلیدی در متن و توضیحات کالا',
        status: 'good',
        score: 10,
        message: 'کلمه کلیدی کانونی در متن نقد و بررسی یا معرفی کالا استفاده شده است.'
      });
    } else {
      checks.push({
        id: 'kw_in_content_ok',
        title: 'کلمه کلیدی در متن محصول',
        status: 'ok',
        score: 4,
        message: 'کلمه کلیدی در متن نقد و بررسی محصول یافت نشد. استفاده از آن در معرفی کالا به سئو کمک می‌کند.'
      });
    }
  }

  // 9. Content Richness / Word Count in TinyMCE
  if (wordCount >= 200) {
    checks.push({
      id: 'content_len_good',
      title: 'حجم متن توضیحات محصول (TinyMCE)',
      status: 'good',
      score: 10,
      message: `تعداد کلمات توضیحات (${formatNumberFa(wordCount)} کلمه) عالی است و از صفحات کالای رقیب متمایز است.`
    });
  } else if (wordCount >= 80) {
    checks.push({
      id: 'content_len_ok',
      title: 'حجم متن توضیحات محصول',
      status: 'ok',
      score: 6,
      message: `تعداد کلمات (${formatNumberFa(wordCount)} کلمه) قابل قبول است. توضیحات با بیش از ۲۰۰ کلمه رتبه بهتری می‌گیرند.`
    });
  } else if (wordCount > 0) {
    checks.push({
      id: 'content_len_bad',
      title: 'حجم متن توضیحات محصول',
      status: 'bad',
      score: 3,
      message: `تعداد کلمات (${formatNumberFa(wordCount)} کلمه) اندک است. پیشنهاد می‌شود جزئیات طعم، بسته و اصالت را کامل کنید.`
    });
  } else {
    checks.push({
      id: 'content_len_empty',
      title: 'توضیحات تخصصی محصول (TinyMCE)',
      status: 'bad',
      score: 0,
      message: 'هنوز نقد و توضیحی در ویرایشگر TinyMCE برای این محصول نوشته نشده است.'
    });
  }

  // 10. Product Featured Image
  if (product.image && product.image.trim() !== '') {
    checks.push({
      id: 'img_good',
      title: 'تصویر شاخص و باکیفیت کالا',
      status: 'good',
      score: 10,
      message: 'تصویر شاخص کالا بارگذاری شده و باعث نمایش تصویر در تب تصاویر گوگل (Google Images) می‌شود.'
    });
  } else {
    checks.push({
      id: 'img_bad',
      title: 'تصویر شاخص محصول',
      status: 'bad',
      score: 0,
      message: 'تصویر شاخص برای محصول بارگذاری نشده است.',
      recommendation: 'یک تصویر باکیفیت و شفاف از بسته یا کارتن محصول آپلود نمایید.'
    });
  }

  // 11. Product Schema & Pricing readiness
  const hasPrice = (product.cartonPrice && product.cartonPrice > 0) || (product.boxPrice && product.boxPrice > 0);
  const hasStock = (product.stockCartons !== undefined && product.stockCartons >= 0);
  if (hasPrice && hasStock) {
    checks.push({
      id: 'schema_pricing_good',
      title: 'ساختار قیمت و موجودی (Google Product Schema)',
      status: 'good',
      score: 10,
      message: 'اطلاعات قیمت عمده و موجودی انبار تکمیل بوده و در اسکیما مارک‌آپ گوگل ایندکس خواهد شد.'
    });
  } else {
    checks.push({
      id: 'schema_pricing_ok',
      title: 'قیمت و موجودی کالا',
      status: 'ok',
      score: 5,
      message: 'قیمت یا موجودی کالا صفر است؛ جهت ثبت در اسکیما گوگل پیشنهاد می‌شود نرخ و موجودی را وارد کنید.'
    });
  }

  // 12. Technical Specifications (Tar, Nicotine, Format)
  const hasTar = Boolean(product.tar && product.tar.trim() !== '' && product.tar !== '-');
  const hasNicotine = Boolean(product.nicotine && product.nicotine.trim() !== '' && product.nicotine !== '-');
  if (hasTar && hasNicotine) {
    checks.push({
      id: 'tech_specs_good',
      title: 'مشخصات فنی و شناسنامه استاندارد (قطران و نیکوتین)',
      status: 'good',
      score: 10,
      message: 'میزان قطران و نیکوتین ثبت شده است؛ این مقادیر در جستجوهای دقیق کاربران نمایش داده می‌شوند.'
    });
  } else {
    checks.push({
      id: 'tech_specs_ok',
      title: 'مشخصات فنی (قطران / نیکوتین)',
      status: 'ok',
      score: 5,
      message: 'مقادیر قطران یا نیکوتین ثبت نشده است. تکمیل شناسنامه فنی نرخ تبدیل را بالا می‌برد.'
    });
  }

  // 13. Authenticity Hologram & Seal
  if (product.hologram && product.hologram !== 'بدون هولوگرام') {
    checks.push({
      id: 'hologram_good',
      title: 'نشان اصالت کالا و برچسب هولوگرام',
      status: 'good',
      score: 10,
      message: `نوع هولوگرام «${product.hologram}» تعیین شده که باعث جلب اعتماد حداکثری و کاهش نرخ پرش می‌شود.`
    });
  } else {
    checks.push({
      id: 'hologram_ok',
      title: 'هولوگرام و اصالت کالا',
      status: 'ok',
      score: 5,
      message: 'وضعیت هولوگرام مشخص نشده است.'
    });
  }

  const totalScorePossible = checks.length * 10;
  const totalScoreObtained = checks.reduce((sum, c) => sum + c.score, 0);
  const overallScore = totalScorePossible > 0 ? Math.min(100, Math.round((totalScoreObtained / totalScorePossible) * 100)) : 0;

  let status: 'good' | 'ok' | 'bad' = 'bad';
  let statusText = 'سئو ضعیف (نیازمند بهینه‌سازی فوری)';
  if (overallScore >= 75) {
    status = 'good';
    statusText = 'سئو عالی و آماده کسب رتبه ۱ گوگل';
  } else if (overallScore >= 50) {
    status = 'ok';
    statusText = 'سئو متوسط (قابل ارتقا)';
  }

  const goodCount = checks.filter(c => c.status === 'good').length;
  const okCount = checks.filter(c => c.status === 'ok').length;
  const badCount = checks.filter(c => c.status === 'bad').length;

  return {
    overallScore,
    status,
    statusText,
    focusKeyword,
    titleLength: titleLen,
    metaDescLength: metaLen,
    wordCount,
    checks,
    goodCount,
    okCount,
    badCount
  };
}
