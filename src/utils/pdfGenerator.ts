import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CigaretteProduct, OrderInvoice } from '../types';
import { formatToman, formatNumberFa } from './formatters';

/**
 * Gets the current system configuration from localStorage or returns default values.
 */
function getDjangoConfig() {
  const defaults = {
    companyName: 'سوین',
    bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
    bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
    bankHolder1: 'امور مالی شرکت سوین',
    bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
    bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
    bankHolder2: 'حساب ترابری و تدارکات سوین',
  };
  try {
    const saved = localStorage.getItem('django_crm_config');
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return defaults;
}

/**
 * Downloads an official PDF of the live price list.
 */
export async function generatePriceListPdf(products: CigaretteProduct[], brandFilter = 'all'): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-price-list-container';
  printContainer.style.position = 'absolute';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.width = '800px';
  printContainer.style.minWidth = '800px';
  printContainer.style.maxWidth = '800px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '24px';
  printContainer.style.fontFamily = "system-ui, -apple-system, 'Samim', 'Vazirmatn', Tahoma, sans-serif";
  printContainer.style.direction = 'rtl';
  printContainer.style.color = '#0f172a';
  printContainer.style.boxSizing = 'border-box';

  const todayStr = new Date().toLocaleDateString('fa-IR');
  const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  const filtered = brandFilter === 'all' 
    ? products 
    : products.filter(p => p.brand === brandFilter);

  printContainer.innerHTML = `
    <table style="width: 752px; min-width: 752px; max-width: 752px; border-collapse: collapse; border: 2px solid #1d4ed8; border-radius: 14px; background: #ffffff; box-sizing: border-box; direction: rtl;">
      <tr>
        <td style="padding: 20px;">
          
          <!-- Header Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #dbeafe; padding-bottom: 14px; margin-bottom: 16px;">
            <tr>
              <td style="text-align: right; vertical-align: middle; padding-bottom: 14px;">
                <div style="font-size: 18px; font-weight: 900; color: #1e3a8a; margin-bottom: 6px;">
                  🏢 سامانه پخش عمده دخانیات ${config.companyName} | لیست رسمی نرخ روز
                </div>
                <div style="font-size: 11px; color: #2563eb; font-weight: bold;">
                  مرکز پخش کارتن و باکس سیگارهای وارداتی اصل و شرکتی | انبار مرکزی جنت‌آباد تهران
                </div>
              </td>
              <td style="text-align: left; vertical-align: middle; padding-bottom: 14px; font-size: 10px; color: #334155; line-height: 1.6; width: 220px;">
                <div><strong>تاریخ صدور:</strong> ${todayStr}</div>
                <div><strong>ساعت استعلام:</strong> ${timeStr}</div>
                <div><strong>واحد سفارشات:</strong> <span style="direction: ltr; font-weight: bold; color: #1d4ed8;">۰۹۱۲۰۷۵۹۴۱۹</span></div>
              </td>
            </tr>
          </table>

          <!-- Notice Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 14px;">
            <tr>
              <td style="padding: 10px 14px; font-size: 10px; color: #1e40af; text-align: right; width: 50%;">
                📌 کلیه نرخ‌ها به <strong>تومان</strong> و برای سفارشات عمده (کارتن و باکس پلمپ انبار) می‌باشد.
              </td>
              <td style="padding: 10px 14px; font-size: 10px; color: #1e40af; text-align: left; width: 50%;">
                🚚 بارگیری مستقیم از انبار جنت‌آباد به باربری‌های وطن، جهانگیر و سراسر کشور
              </td>
            </tr>
          </table>

          <!-- Products Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: right; margin-bottom: 16px;">
            <thead>
              <tr style="background: #1d4ed8; color: #ffffff; font-weight: bold;">
                <th style="padding: 10px 8px; width: 35px; text-align: center;">ردیف</th>
                <th style="padding: 10px 8px;">نام کالا و مارک</th>
                <th style="padding: 10px 8px; text-align: center; width: 150px;">مبدأ / هولوگرام</th>
                <th style="padding: 10px 8px; text-align: center; width: 140px;">بسته‌بندی</th>
                <th style="padding: 10px 8px; text-align: left; width: 110px;">نرخ هر باکس (تومان)</th>
                <th style="padding: 10px 8px; text-align: left; font-weight: 900; width: 150px;">نرخ هر کارتن (تومان)</th>
                <th style="padding: 10px 8px; text-align: center; width: 80px;">حداقل سفارش</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((p, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 8px; text-align: center; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 8px;">
                    <strong style="color: #0f172a; font-size: 11px;">${p.nameFa}</strong>
                    <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${p.nameEn} • ${p.brand}</div>
                  </td>
                  <td style="padding: 8px; text-align: center; color: #334155;">${p.origin} (${p.hologram})</td>
                  <td style="padding: 8px; text-align: center; color: #475569;">${formatNumberFa(p.boxesPerCarton)} باکس (۵۰۰ پاکت)</td>
                  <td style="padding: 8px; text-align: left; font-weight: bold; color: #1e293b;">${formatToman(p.boxPrice)}</td>
                  <td style="padding: 8px; text-align: left; font-weight: 900; color: #1d4ed8;">${formatToman(p.cartonPrice)}</td>
                  <td style="padding: 8px; text-align: center; color: #047857; font-weight: bold;">${formatNumberFa(p.moq)} کارتن</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Footer Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 18px; padding-top: 12px; border-top: 2px solid #e2e8f0; font-size: 9.5px; color: #64748b;">
            <tr>
              <td style="text-align: right; padding-top: 10px;">
                <span>انبار مرکزی و بارگیری: تهران، جنت‌آباد (شهید آبشناسان) | ثبت سفارشات عمده: <strong>۰۹۱۲۰۷۵۹۴۱۹</strong></span>
              </td>
              <td style="text-align: left; padding-top: 10px;">
                <span>سامانه آنلاین پخش عمده ${config.companyName} (${config.companyName} Wholesale)</span>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `;

  const originalMinWidth = document.body.style.minWidth;
  const originalOverflow = document.body.style.overflow;
  document.body.style.minWidth = '850px';
  document.body.style.overflow = 'visible';

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 100));

    const printContainerHeight = printContainer.offsetHeight || 1131; // fallback
    const pdfHeight = (printContainerHeight * 210) / 800;

    const imgData = await toJpeg(printContainer, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      fontEmbedCSS: '',
      skipFonts: true,
      width: 800,
      height: printContainerHeight,
    });

    const pdf = new jsPDF('p', 'mm', [210, pdfHeight]);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, pdfHeight);
    pdf.save(`لیست_نرخ_دخانیات_${config.companyName}_${todayStr.replace(/\//g, '-')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Price List PDF:', error);
    window.print();
    return false;
  } finally {
    document.body.style.minWidth = originalMinWidth;
    document.body.style.overflow = originalOverflow;
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Downloads an official Proforma Invoice PDF with freight cost.
 */
export async function generateInvoicePdf(invoice: OrderInvoice): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-invoice-container';
  printContainer.style.position = 'absolute';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.width = '800px';
  printContainer.style.minWidth = '800px';
  printContainer.style.maxWidth = '800px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '24px';
  printContainer.style.fontFamily = "system-ui, -apple-system, 'Samim', 'Vazirmatn', Tahoma, sans-serif";
  printContainer.style.direction = 'rtl';
  printContainer.style.color = '#0f172a';
  printContainer.style.boxSizing = 'border-box';

  const trackingCode = invoice.trackingCode || invoice.orderId;

  printContainer.innerHTML = `
    <table style="width: 752px; min-width: 752px; max-width: 752px; border-collapse: collapse; border: 2px solid #1d4ed8; border-radius: 14px; background: #ffffff; box-sizing: border-box; direction: rtl;">
      <tr>
        <td style="padding: 20px;">
          
          <!-- Header Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #dbeafe; padding-bottom: 14px; margin-bottom: 16px;">
            <tr>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-size: 18px; font-weight: 900; color: #1e3a8a; margin-bottom: 6px;">
                  پیش‌فاکتور رسمی فروش عمده دخانیات ${config.companyName}
                </div>
                <div style="font-size: 11px; color: #2563eb; font-weight: bold; margin-bottom: 4px;">
                  توزیع و پخش سراسری کارتن و باکس پلمپ | انبار مرکزی جنت‌آباد تهران
                </div>
                <div style="font-size: 10px; color: #475569;">
                  تلفن سفارش و ترابری باربری: <strong style="color: #1d4ed8;">۰۹۱۲۰۷۵۹۴۱۹</strong>
                </div>
              </td>
              <td style="text-align: left; vertical-align: top; font-size: 10.5px; color: #334155; line-height: 1.7; width: 220px;">
                <div><strong>شماره پیش‌فاکتور:</strong> <span style="font-family: monospace; font-weight: bold; color: #1e40af;">${invoice.orderId}</span></div>
                <div><strong>کد رهگیری بار:</strong> <span style="font-family: monospace; font-weight: bold; color: #047857;">${trackingCode}</span></div>
                <div><strong>تاریخ صدور:</strong> ${invoice.createdAt}</div>
                <div><strong>وضعیت پرداخت:</strong> <span style="font-weight: bold; color: #1d4ed8;">${invoice.paymentStatus}</span></div>
              </td>
            </tr>
          </table>

          <!-- Customer Grid Table (Replacement for CSS Grid to avoid RTL overlap) -->
          <table style="width: 100%; border-collapse: collapse; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 14px; font-size: 10px;">
            <tr>
              <td style="width: 50%; padding: 12px 14px; text-align: right; vertical-align: top; line-height: 1.8; border-left: 1px solid #bfdbfe;">
                <div><strong>نام خریدار / بنکدار:</strong> ${invoice.customer.shopOwnerName}</div>
                <div style="margin-top: 4px;"><strong>نام مغازه:</strong> ${invoice.customer.shopName || '—'}</div>
                <div style="margin-top: 4px;"><strong>شماره همراه:</strong> <span style="direction: ltr; font-weight: bold;">${invoice.customer.shopPhone}</span></div>
              </td>
              <td style="width: 50%; padding: 12px 14px; text-align: right; vertical-align: top; line-height: 1.8;">
                <div><strong>شهر مقصد:</strong> ${invoice.customer.city}</div>
                <div style="margin-top: 4px;"><strong>شیوه ارسال بار:</strong> ${invoice.customer.shippingMethod}</div>
                <div style="margin-top: 4px;"><strong>آدرس و توضیحات تحویل:</strong> ${invoice.customer.address}</div>
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: right; margin-bottom: 16px;">
            <thead>
              <tr style="background: #1d4ed8; color: #ffffff; font-weight: bold;">
                <th style="padding: 10px 8px; width: 35px; text-align: center;">ردیف</th>
                <th style="padding: 10px 8px;">شرح کالا و برند</th>
                <th style="padding: 10px 8px; text-align: center; width: 140px;">واحد کالا</th>
                <th style="padding: 10px 8px; text-align: center; width: 80px;">تعداد</th>
                <th style="padding: 10px 8px; text-align: left; width: 120px;">نرخ واحد (تومان)</th>
                <th style="padding: 10px 8px; text-align: left; font-weight: bold; width: 150px;">مبلغ کل (تومان)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, idx) => {
                const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
                const itemTotal = unitPrice * item.quantity;
                return `
                  <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="padding: 8px; text-align: center; color: #64748b;">${idx + 1}</td>
                    <td style="padding: 8px;">
                      <strong style="color: #0f172a; font-size: 11px;">${item.product.nameFa}</strong>
                      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${item.product.brand} - ${item.product.origin}</div>
                    </td>
                    <td style="padding: 8px; text-align: center;">${item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ تایی)'}</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold; font-size: 11px;">${formatNumberFa(item.quantity)}</td>
                    <td style="padding: 8px; text-align: left;">${formatToman(unitPrice)}</td>
                    <td style="padding: 8px; text-align: left; font-weight: bold; color: #1d4ed8; font-size: 11px;">${formatToman(itemTotal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Financial Totals Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr>
              <!-- Terms & Notes (Left Side) -->
              <td style="text-align: right; vertical-align: top; font-size: 9.5px; color: #475569; line-height: 1.8; padding-left: 24px;">
                <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">شرایط و قوانین تحویل بار:</div>
                <div>• کلیه بارها با بسته‌بندی پلمپ شرکتی و هولوگرام تضمین اصالت ${config.companyName} تحویل داده می‌شود.</div>
                <div>• ارسال بار بلافاصله پس از تسویه حواله از طریق باربری‌های معتبر (وطن، جهانگیر و تیپاکس) انجام می‌پذیرد.</div>
                <div>• شماره تماس هماهنگی ترابری و دریافت اطلاعات بیجک: <strong>۰۹۱۲۰۷۵۹۴۱۹</strong></div>
              </td>
              <!-- Invoice Totals Box (Right Side with Fixed Width) -->
              <td style="width: 300px; text-align: right; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 10px;">
                  <tr>
                    <td style="padding: 6px 10px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">تعداد کل کارتن‌ها:</td>
                    <td style="padding: 6px 10px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatNumberFa(invoice.totalCartons)} کارتن</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 10px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">تعداد کل باکس‌ها:</td>
                    <td style="padding: 6px 10px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatNumberFa(invoice.totalBoxes)} باکس</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 10px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">جمع کل اقلام:</td>
                    <td style="padding: 6px 10px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatToman(invoice.subtotal)}</td>
                  </tr>
                  ${invoice.discountAmount > 0 ? `
                    <tr>
                      <td style="padding: 6px 10px; text-align: right; color: #047857; font-weight: bold; border-bottom: 1px solid #e2e8f0;">تخفیف تیراژ:</td>
                      <td style="padding: 6px 10px; text-align: left; color: #047857; font-weight: bold; border-bottom: 1px solid #e2e8f0;">-${formatToman(invoice.discountAmount)}</td>
                    </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 6px 10px; text-align: right; color: #2563eb; font-weight: bold; border-bottom: 1px solid #e2e8f0;">هزینه باربری و ارسال:</td>
                    <td style="padding: 6px 10px; text-align: left; color: #2563eb; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${invoice.shippingCost > 0 ? formatToman(invoice.shippingCost) : 'رایگان (تحویل انبار)'}</td>
                  </tr>
                  <tr style="font-weight: 900; color: #1d4ed8; font-size: 12.5px;">
                    <td style="padding: 10px 10px; text-align: right;">مبلغ نهایی فاکتور:</td>
                    <td style="padding: 10px 10px; text-align: left;">${formatToman(invoice.finalTotal)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Signatures Table (Replacement for Flexbox to avoid overlap) -->
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; color: #475569; padding-top: 18px; border-top: 1px dashed #cbd5e1; text-align: center; margin-top: 14px;">
            <tr>
              <td style="width: 50%; padding-top: 10px;">
                <div>امضاء و مهر مدیریت پخش دخانیات ${config.companyName}:</div>
                <div style="margin-top: 28px; color: #94a3b8;">...................................</div>
              </td>
              <td style="width: 50%; padding-top: 10px;">
                <div>امضاء و تأیید خریدار / بنکدار:</div>
                <div style="margin-top: 28px; color: #94a3b8;">...................................</div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `;

  const originalMinWidth = document.body.style.minWidth;
  const originalOverflow = document.body.style.overflow;
  document.body.style.minWidth = '850px';
  document.body.style.overflow = 'visible';

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 100));

    const printContainerHeight = printContainer.offsetHeight || 1131; // fallback
    const pdfHeight = (printContainerHeight * 210) / 800;

    const imgData = await toJpeg(printContainer, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      fontEmbedCSS: '',
      skipFonts: true,
      width: 800,
      height: printContainerHeight,
    });

    const pdf = new jsPDF('p', 'mm', [210, pdfHeight]);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, pdfHeight);
    pdf.save(`پیش_فاکتور_${config.companyName}_${invoice.orderId}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    window.print();
    return false;
  } finally {
    document.body.style.minWidth = originalMinWidth;
    document.body.style.overflow = originalOverflow;
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}
