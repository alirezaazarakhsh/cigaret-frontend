import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CigaretteProduct, OrderInvoice, PosReceiptInvoice } from '../types';
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
    transportPhoneCompany: '۰۹۱۲۰۷۵۹۴۱۹',
    nationalIdCompany: '۱۰۱۰۳۸۵۲۹۱۰',
    economicCodeCompany: '۴۱۱۴۹۸۷۵۳۱۱۹',
    activityTypeCompany: 'پخش عمده دخانیات',
    showNationalIdInvoice: true,
    showEconomicCodeInvoice: true,
    showActivityTypeInvoice: true,
    showTransportPhoneInvoice: true,
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
 * Downloads an official, multi-page or single-page PDF of the live price list with zero overflow.
 */
export async function generatePriceListPdf(products: CigaretteProduct[], brandFilter = 'all'): Promise<boolean> {
  const config = getDjangoConfig();
  const todayStr = new Date().toLocaleDateString('fa-IR');
  const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

  const filtered = brandFilter === 'all' 
    ? products 
    : products.filter(p => p.brand === brandFilter);

  if (filtered.length === 0) {
    return false;
  }

  // Split into pages (12 items per page max to guarantee no overflow)
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const pdf = new jsPDF('p', 'mm', 'a4');

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const pageProducts = filtered.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE);

      const printContainer = document.createElement('div');
      printContainer.id = `pdf-price-list-page-${pageIdx}`;
      printContainer.style.position = 'fixed';
      printContainer.style.left = '0px';
      printContainer.style.top = '0px';
      printContainer.style.zIndex = '-9999';
      printContainer.style.width = '794px';
      printContainer.style.height = '1123px';
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.padding = '20px';
      printContainer.style.boxSizing = 'border-box';
      printContainer.style.overflow = 'hidden';
      printContainer.style.direction = 'ltr';
      printContainer.style.pointerEvents = 'none';

      printContainer.innerHTML = `
        <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, sans-serif; color: #0f172a; box-sizing: border-box; border: 2px solid #1d4ed8; border-radius: 12px; padding: 16px; background: #ffffff;">
          
          <div>
            <!-- Header Table -->
            <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #dbeafe; padding-bottom: 8px; margin-bottom: 10px; direction: rtl; text-align: right;">
              <tr>
                <td style="text-align: right; vertical-align: middle; padding-bottom: 8px;">
                  <div style="font-size: 16px; font-weight: 900; color: #1e3a8a; margin-bottom: 3px;">
                    🏢 سامانه پخش عمده دخانیات ${config.companyName} | لیست رسمی نرخ روز
                  </div>
                  <div style="font-size: 10px; color: #2563eb; font-weight: bold;">
                    مرکز پخش کارتن و باکس سیگارهای وارداتی و شرکتی | انبار مرکزی تهران
                  </div>
                </td>
                <td style="text-align: left; vertical-align: middle; padding-bottom: 8px; font-size: 9.5px; color: #334155; line-height: 1.5; width: 210px;">
                  <div><strong>تاریخ صدور:</strong> ${todayStr}</div>
                  <div><strong>ساعت استعلام:</strong> ${timeStr}</div>
                  <div><strong>واحد سفارشات:</strong> <span style="direction: ltr; font-weight: bold; color: #1d4ed8;">۰۹۱۲۰۷۵۹۴۱۹</span></div>
                  <div><strong>صفحه:</strong> ${formatNumberFa(pageIdx + 1)} از ${formatNumberFa(totalPages)}</div>
                </td>
              </tr>
            </table>

            <!-- Notice Bar -->
            <table style="width: 100%; border-collapse: collapse; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; margin-bottom: 10px; direction: rtl; text-align: right;">
              <tr>
                <td style="padding: 6px 10px; font-size: 9.5px; color: #1e40af; text-align: right; width: 50%;">
                  📌 نرخ‌ها به <strong>تومان</strong> و برای سفارشات عمده (کارتن و باکس پلمپ انبار) می‌باشد.
                </td>
                <td style="padding: 6px 10px; font-size: 9.5px; color: #1e40af; text-align: left; width: 50%;">
                  🚚 بارگیری از انبار مرکزی به سراسر کشور با بیجک رسمی باربری
                </td>
              </tr>
            </table>

            <!-- Products Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right; margin-bottom: 8px; direction: rtl;">
              <thead>
                <tr style="background: #1d4ed8; color: #ffffff; font-weight: bold;">
                  <th style="padding: 8px 4px; width: 5%; text-align: center; border: 1px solid #1d4ed8;">ردیف</th>
                  <th style="padding: 8px 6px; width: 33%; border: 1px solid #1d4ed8; text-align: right;">نام کالا و مارک</th>
                  <th style="padding: 8px 6px; width: 18%; text-align: center; border: 1px solid #1d4ed8;">مبدأ / هولوگرام</th>
                  <th style="padding: 8px 6px; width: 14%; text-align: center; border: 1px solid #1d4ed8;">بسته‌بندی</th>
                  <th style="padding: 8px 6px; width: 15%; text-align: left; border: 1px solid #1d4ed8;">نرخ باکس (تومان)</th>
                  <th style="padding: 8px 6px; width: 15%; text-align: left; font-weight: 900; border: 1px solid #1d4ed8;">نرخ کارتن (تومان)</th>
                </tr>
              </thead>
              <tbody>
                ${pageProducts.map((p, idx) => {
                  const globalIdx = pageIdx * ITEMS_PER_PAGE + idx + 1;
                  return `
                    <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="padding: 6px 4px; text-align: center; color: #64748b; border: 1px solid #e2e8f0;">${globalIdx}</td>
                      <td style="padding: 6px 6px; border: 1px solid #e2e8f0; text-align: right;">
                        <strong style="color: #0f172a; font-size: 10px;">${p.nameFa}</strong>
                        <div style="font-size: 8.5px; color: #64748b;">${p.nameEn || ''} • ${p.brand}</div>
                      </td>
                      <td style="padding: 6px 4px; text-align: center; color: #334155; border: 1px solid #e2e8f0; font-size: 9px;">${p.origin}</td>
                      <td style="padding: 6px 4px; text-align: center; color: #475569; border: 1px solid #e2e8f0; font-size: 9px;">${p.isBoxOnly ? 'تک باکس' : `${formatNumberFa(p.boxesPerCarton)} باکس`}</td>
                      <td style="padding: 6px 6px; text-align: left; font-weight: bold; color: #1e293b; border: 1px solid #e2e8f0; font-size: 9.5px;">${formatToman(p.boxPrice)}</td>
                      <td style="padding: 6px 6px; text-align: left; font-weight: 900; color: #1d4ed8; border: 1px solid #e2e8f0; font-size: 10px;">${p.cartonPrice > 0 ? formatToman(p.cartonPrice) : '—'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; padding-top: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; color: #64748b; direction: rtl; text-align: right;">
              <tr>
                <td style="text-align: right;">
                  <span>انبار مرکزی: تهران، جنت‌آباد | ثبت سفارشات عمده: <strong>۰۹۱۲۰۷۵۹۴۱۹</strong></span>
                </td>
                <td style="text-align: left;">
                  <span>سامانه بنکداری ${config.companyName} | صفحه ${formatNumberFa(pageIdx + 1)} از ${formatNumberFa(totalPages)}</span>
                </td>
              </tr>
            </table>
          </div>

        </div>
      `;

      document.body.appendChild(printContainer);

      await new Promise(r => setTimeout(r, 120));

      const imgData = await toJpeg(printContainer, {
        quality: 0.96,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: 794,
        height: 1123,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      if (pageIdx > 0) {
        pdf.addPage('a4', 'p');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      document.body.removeChild(printContainer);
    }

    pdf.save(`لیست_نرخ_دخانیات_${config.companyName}_${todayStr.replace(/\//g, '-')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Price List PDF:', error);
    window.print();
    return false;
  }
}

/**
 * Downloads an official Proforma Invoice PDF with freight cost.
 */
export async function generateInvoicePdf(invoice: OrderInvoice): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-invoice-container';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.width = '794px';
  printContainer.style.height = '1123px';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '20px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.overflow = 'hidden';
  printContainer.style.direction = 'ltr';
  printContainer.style.pointerEvents = 'none';

  const trackingCode = invoice.trackingCode || invoice.orderId;

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, sans-serif; color: #0f172a; box-sizing: border-box; border: 2px solid #1d4ed8; border-radius: 12px; padding: 16px; background: #ffffff;">
      <div>
        <!-- Header Table -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #dbeafe; padding-bottom: 8px; margin-bottom: 10px; direction: rtl; text-align: right;">
          <tr>
            <td style="text-align: right; vertical-align: top; padding-bottom: 8px;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a; margin-bottom: 3px; white-space: nowrap;">
                صورتحساب فروش کالا و خدمات (پیش‌فاکتور رسمی)
              </div>
              <div style="font-size: 10.5px; color: #475569; font-weight: bold; margin-bottom: 3px;">
                سامانه پخش سراسری دخانیات ${config.companyName}
              </div>
              <div style="font-size: 9.5px; color: #475569;">
                تلفن ترابری و سفارشات: <strong style="color: #1d4ed8; direction: ltr; display: inline-block;">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong>
              </div>
            </td>
            <td style="text-align: left; vertical-align: top; padding-bottom: 8px; font-size: 10px; color: #334155; line-height: 1.6; width: 220px;">
              <div><strong>شماره فاکتور:</strong> <span style="font-family: monospace; font-weight: bold; color: #1e40af;">${invoice.orderId}</span></div>
              <div><strong>کد رهگیری بار:</strong> <span style="font-family: monospace; font-weight: bold; color: #047857;">${trackingCode}</span></div>
              <div><strong>تاریخ صدور:</strong> ${invoice.createdAt}</div>
              <div><strong>وضعیت پرداخت:</strong> <span style="font-weight: bold; color: #1d4ed8;">${invoice.paymentStatus}</span></div>
            </td>
          </tr>
        </table>

        <!-- Credentials Row -->
        ${(config.showNationalIdInvoice || config.showEconomicCodeInvoice || config.showActivityTypeInvoice || config.showTransportPhoneInvoice) ? `
          <table style="width: 100%; border-collapse: collapse; background: #0f172a; color: #ffffff; border-radius: 6px; margin-bottom: 10px; font-size: 9px; direction: rtl; text-align: right;">
            <tr>
              <td style="padding: 5px 8px; text-align: center; font-weight: 500;">
                <div style="display: flex; justify-content: space-around; width: 100%;">
                  ${config.showNationalIdInvoice ? `<div style="margin-left: 8px;">شناسه ملی: <strong style="color: #f59e0b; font-family: monospace;">${config.nationalIdCompany || '۱۰۱۰۳۸۵۲۹۱۰'}</strong></div>` : ''}
                  ${config.showEconomicCodeInvoice ? `<div style="margin-left: 8px;">کد اقتصادی: <strong style="color: #f59e0b; font-family: monospace;">${config.economicCodeCompany || '۴۱۱۴۹۸۷۵۳۱۱۹'}</strong></div>` : ''}
                  ${config.showActivityTypeInvoice ? `<div style="margin-left: 8px;">نوع فعالیت: <strong style="color: #f59e0b;">${config.activityTypeCompany || 'پخش عمده دخانیات'}</strong></div>` : ''}
                  ${config.showTransportPhoneInvoice ? `<div>تلفن ترابری: <strong style="color: #f59e0b; font-family: monospace; direction: ltr; display: inline-block;">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong></div>` : ''}
                </div>
              </td>
            </tr>
          </table>
        ` : ''}

        <!-- Customer Grid Table -->
        <table style="width: 100%; border-collapse: collapse; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; margin-bottom: 10px; font-size: 10px; direction: rtl; text-align: right;">
          <tr>
            <td style="width: 50%; padding: 8px 10px; text-align: right; vertical-align: top; line-height: 1.7; border-left: 1px solid #bfdbfe;">
              <div><strong>نام خریدار / بنکدار:</strong> ${invoice.customer.shopOwnerName}</div>
              <div style="margin-top: 2px;"><strong>نام مغازه:</strong> ${invoice.customer.shopName || '—'}</div>
              <div style="margin-top: 2px;"><strong>شماره همراه:</strong> <span style="direction: ltr; font-weight: bold; display: inline-block;">${invoice.customer.shopPhone}</span></div>
            </td>
            <td style="width: 50%; padding: 8px 10px; text-align: right; vertical-align: top; line-height: 1.7;">
              <div><strong>شهر مقصد:</strong> ${invoice.customer.city}</div>
              <div style="margin-top: 2px;"><strong>شیوه ارسال بار:</strong> ${invoice.customer.shippingMethod}</div>
              <div style="margin-top: 2px;"><strong>آدرس تحویل:</strong> ${invoice.customer.address}</div>
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: right; margin-bottom: 12px; direction: rtl;">
          <thead>
            <tr style="background: #1d4ed8; color: #ffffff; font-weight: bold;">
              <th style="padding: 8px 4px; width: 6%; text-align: center; border: 1px solid #1d4ed8;">ردیف</th>
              <th style="padding: 8px 6px; width: 36%; border: 1px solid #1d4ed8; text-align: right;">شرح کالا و برند</th>
              <th style="padding: 8px 6px; width: 16%; text-align: center; border: 1px solid #1d4ed8;">واحد کالا</th>
              <th style="padding: 8px 4px; width: 10%; text-align: center; border: 1px solid #1d4ed8;">تعداد</th>
              <th style="padding: 8px 6px; width: 16%; text-align: left; border: 1px solid #1d4ed8;">نرخ واحد (تومان)</th>
              <th style="padding: 8px 6px; width: 16%; text-align: left; font-weight: bold; border: 1px solid #1d4ed8;">مبلغ کل (تومان)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, idx) => {
              const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
              const itemTotal = unitPrice * item.quantity;
              return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 6px 4px; text-align: center; color: #64748b; border: 1px solid #e2e8f0;">${idx + 1}</td>
                  <td style="padding: 6px 6px; border: 1px solid #e2e8f0; text-align: right;">
                    <strong style="color: #0f172a; font-size: 10.5px;">${item.product.nameFa}</strong>
                    <div style="font-size: 8.5px; color: #64748b;">${item.product.brand} - ${item.product.origin}</div>
                  </td>
                  <td style="padding: 6px 4px; text-align: center; border: 1px solid #e2e8f0; font-size: 9.5px;">${item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ تایی)'}</td>
                  <td style="padding: 6px 4px; text-align: center; font-weight: bold; font-size: 10px; border: 1px solid #e2e8f0;">${formatNumberFa(item.quantity)}</td>
                  <td style="padding: 6px 6px; text-align: left; border: 1px solid #e2e8f0; font-size: 9.5px;">${formatToman(unitPrice)}</td>
                  <td style="padding: 6px 6px; text-align: left; font-weight: bold; color: #1d4ed8; font-size: 10px; border: 1px solid #e2e8f0;">${formatToman(itemTotal)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financials and Signatures -->
      <div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; direction: rtl; text-align: right;">
          <tr>
            <td style="text-align: right; vertical-align: top; font-size: 9px; color: #475569; line-height: 1.7; padding-left: 16px;">
              <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 4px; font-size: 10px;">شرایط و قوانین تحویل بار:</div>
              <div>• کلیه بارها با بسته‌بندی پلمپ شرکتی و هولوگرام تضمین اصالت تحویل داده می‌شود.</div>
              <div>• ارسال بار بلافاصله پس از تسویه حواله از طریق باربری‌های معتبر انجام می‌پذیرد.</div>
              <div>• شماره تماس هماهنگی ترابری و دریافت بیجک: <strong style="color: #1d4ed8;">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong></div>
            </td>
            <td style="width: 280px; text-align: right; vertical-align: top;">
              <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10px;">
                <tr>
                  <td style="padding: 5px 8px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">تعداد کل کارتن‌ها:</td>
                  <td style="padding: 5px 8px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatNumberFa(invoice.totalCartons)} کارتن</td>
                </tr>
                <tr>
                  <td style="padding: 5px 8px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">تعداد کل باکس‌ها:</td>
                  <td style="padding: 5px 8px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatNumberFa(invoice.totalBoxes)} باکس</td>
                </tr>
                <tr>
                  <td style="padding: 5px 8px; text-align: right; color: #475569; border-bottom: 1px solid #e2e8f0;">جمع اقلام:</td>
                  <td style="padding: 5px 8px; text-align: left; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${formatToman(invoice.subtotal)}</td>
                </tr>
                ${invoice.discountAmount > 0 ? `
                  <tr>
                    <td style="padding: 5px 8px; text-align: right; color: #047857; font-weight: bold; border-bottom: 1px solid #e2e8f0;">تخفیف تیراژ:</td>
                    <td style="padding: 5px 8px; text-align: left; color: #047857; font-weight: bold; border-bottom: 1px solid #e2e8f0;">-${formatToman(invoice.discountAmount)}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 5px 8px; text-align: right; color: #2563eb; font-weight: bold; border-bottom: 1px solid #e2e8f0;">هزینه باربری:</td>
                  <td style="padding: 5px 8px; text-align: left; color: #2563eb; font-weight: bold; border-bottom: 1px solid #e2e8f0;">${invoice.shippingCost > 0 ? formatToman(invoice.shippingCost) : 'تحویل انبار (رایگان)'}</td>
                </tr>
                <tr style="font-weight: 900; color: #1d4ed8; font-size: 12px; background-color: #eff6ff;">
                  <td style="padding: 8px 8px; text-align: right;">مبلغ نهایی فاکتور:</td>
                  <td style="padding: 8px 8px; text-align: left;">${formatToman(invoice.finalTotal)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Signatures Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; color: #475569; padding-top: 12px; border-top: 1px dashed #cbd5e1; text-align: center; direction: rtl;">
          <tr>
            <td style="width: 50%; padding-top: 6px;">
              <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 16px;">امضاء و مهر مدیریت پخش دخانیات:</div>
              <div style="margin-top: 20px; color: #94a3b8;">...................................</div>
            </td>
            <td style="width: 50%; padding-top: 6px;">
              <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 16px;">امضاء و تأیید خریدار / بنکدار:</div>
              <div style="margin-top: 20px; color: #94a3b8;">...................................</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 120));

    const imgData = await toJpeg(printContainer, {
      quality: 0.96,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      width: 794,
      height: 1123,
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    pdf.save(`پیش_فاکتور_${config.companyName}_${invoice.orderId}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    window.print();
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Downloads an official, 80mm thermal receipt PDF (رستورانی / صندوق) with zero overflow.
 */
export async function generatePosThermalReceiptPdf(receipt: PosReceiptInvoice): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-pos-thermal-receipt';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';

  // 380px container width simulates crisp 80mm thermal receipt roll
  const containerWidthPx = 380;
  // Calculate dynamic height based on number of items (base ~380px + ~50px per item)
  const baseHeightPx = 380;
  const itemsHeightPx = receipt.items.length * 50;
  const totalHeightPx = baseHeightPx + itemsHeightPx;

  // 80mm width standard thermal roll. Height scaled proportionally in mm (80mm * totalHeightPx / containerWidthPx)
  const receiptWidthMm = 80;
  const receiptHeightMm = Math.max(120, Math.round((receiptWidthMm * totalHeightPx) / containerWidthPx));

  printContainer.style.width = `${containerWidthPx}px`;
  printContainer.style.height = `${totalHeightPx}px`;
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '14px 12px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.overflow = 'hidden';
  printContainer.style.direction = 'ltr';
  printContainer.style.pointerEvents = 'none';

  const paymentMethodText = 
    receipt.paymentMethod === 'pos_terminal' ? 'کارتخوان بانکی' :
    receipt.paymentMethod === 'cash' ? 'پرداخت نقدی' : 'حساب دفتری (نسیه)';

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: center; width: 100%; height: 100%; font-family: 'Vazirmatn', 'Samim', system-ui, -apple-system, sans-serif; color: #000000; background: #ffffff; box-sizing: border-box; font-size: 11px; line-height: 1.4; display: flex; flex-direction: column; justify-content: space-between;">
      
      <div>
        <!-- Receipt Header -->
        <div style="border-bottom: 2px dashed #000000; padding-bottom: 8px; margin-bottom: 8px;">
          <div style="font-size: 15px; font-weight: 900; color: #000000; margin-bottom: 2px;">
            ${config.companyName ? `فروشگاه و بنکداری ${config.companyName}` : 'فروشگاه و پخش سراسری سوین'}
          </div>
          <div style="font-size: 10px; font-weight: bold; color: #111827;">
            رسید رسمی فروش صندوق (فیش حرارتی)
          </div>
          <div style="font-size: 9px; color: #374151; margin-top: 3px;">
            تلفن سفارشات: ${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}
          </div>
        </div>

        <!-- Receipt Metadata -->
        <div style="border-bottom: 1px dashed #000000; padding-bottom: 6px; margin-bottom: 8px; font-size: 9.5px; text-align: right; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>شماره فاکتور:</strong> <span style="font-family: monospace; font-weight: bold;">${receipt.receiptNumber}</span></span>
            <span><strong>تاریخ:</strong> ${receipt.createdAt}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 2px;">
            <span><strong>مشتری / خریدار:</strong> ${receipt.customerName || 'مشتری حضوری'}</span>
            <span><strong>روش پرداخت:</strong> ${paymentMethodText}</span>
          </div>
          ${receipt.terminalRefNumber ? `
            <div style="margin-top: 2px;">
              <strong>شماره پیگیری کارتخوان:</strong> <span style="font-family: monospace;">${receipt.terminalRefNumber}</span>
            </div>
          ` : ''}
          ${receipt.cashier ? `
            <div style="margin-top: 2px; color: #4b5563;">
              <strong>صندوق‌دار:</strong> ${receipt.cashier}
            </div>
          ` : ''}
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; text-align: right; margin-bottom: 8px; direction: rtl;">
          <thead>
            <tr style="border-bottom: 1.5px solid #000000; background: #f3f4f6; font-weight: bold;">
              <th style="padding: 4px 2px; text-align: right; width: 44%;">شرح کالا</th>
              <th style="padding: 4px 2px; text-align: center; width: 18%;">واحد/تعداد</th>
              <th style="padding: 4px 2px; text-align: left; width: 18%;">فی (تومان)</th>
              <th style="padding: 4px 2px; text-align: left; width: 20%;">جمع (تومان)</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map((item) => {
              const unitLabel = item.unit === 'carton' ? 'کارتن' : item.unit === 'box' ? 'باکس' : 'پاکت';
              return `
                <tr style="border-bottom: 1px dashed #d1d5db;">
                  <td style="padding: 4px 2px; text-align: right; font-weight: bold; font-size: 9px; line-height: 1.2;">
                    ${item.product.nameFa}
                  </td>
                  <td style="padding: 4px 2px; text-align: center; font-size: 9px;">
                    ${formatNumberFa(item.quantity)} ${unitLabel}
                  </td>
                  <td style="padding: 4px 2px; text-align: left; font-size: 9px;">
                    ${formatToman(item.unitPrice)}
                  </td>
                  <td style="padding: 4px 2px; text-align: left; font-weight: bold; font-size: 9.5px;">
                    ${formatToman(item.totalPrice)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totals & Summary -->
        <div style="border-top: 1.5px solid #000000; border-bottom: 1.5px solid #000000; padding: 6px 0; margin-bottom: 8px; font-size: 10px; line-height: 1.7;">
          <div style="display: flex; justify-content: space-between;">
            <span>جمع کل اقلام:</span>
            <span>${formatToman(receipt.subtotal)} تومان</span>
          </div>
          ${receipt.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: #047857; font-weight: bold;">
              <span>مبلغ تخفیف:</span>
              <span>-${formatToman(receipt.discountAmount)} تومان</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 900; margin-top: 2px; padding-top: 2px; border-top: 1px dashed #000000;">
            <span>مبلغ قابل پرداخت:</span>
            <span>${formatToman(receipt.finalTotal)} تومان</span>
          </div>
        </div>

        ${receipt.notes ? `
          <div style="font-size: 8.5px; color: #374151; text-align: right; margin-bottom: 8px; padding: 4px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">
            <strong>توضیحات:</strong> ${receipt.notes}
          </div>
        ` : ''}
      </div>

      <!-- Receipt Footer Barcode & Thank You -->
      <div style="border-top: 1px dashed #000000; padding-top: 6px; text-align: center; font-size: 9px;">
        <div style="font-weight: bold; margin-bottom: 4px;">با سپاس از خرید و اعتماد شما</div>
        <div style="font-family: monospace; font-size: 14px; letter-spacing: 3px; font-weight: bold; margin-bottom: 2px;">
          ||||| ||||||| ||||| ||||
        </div>
        <div style="font-family: monospace; font-size: 8px; letter-spacing: 1px;">${receipt.receiptNumber}</div>
      </div>

    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 120));

    const imgData = await toJpeg(printContainer, {
      quality: 0.98,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      width: containerWidthPx,
      height: totalHeightPx,
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const pdf = new jsPDF('p', 'mm', [receiptWidthMm, receiptHeightMm]);
    pdf.addImage(imgData, 'JPEG', 0, 0, receiptWidthMm, receiptHeightMm);
    pdf.save(`فیش_حرارتی_${receipt.receiptNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Thermal Receipt PDF:', error);
    window.print();
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

export const generateThermalReceiptPdf = generatePosThermalReceiptPdf;
