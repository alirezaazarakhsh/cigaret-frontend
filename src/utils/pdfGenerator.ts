import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CigaretteProduct, OrderInvoice, PosReceiptInvoice } from '../types';
import { formatToman, formatNumberFa } from './formatters';

/**
 * Gets the current system configuration from localStorage or returns default values.
 */
function getDjangoConfig() {
  const defaults = {
    companyName: 'دخانیات سرو',
    bankCard1: '۶۰۳۷-۹۹۷۹-۷۵۳۱-۱۹۸۲',
    bankShiba1: 'IR۷۲۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۱۲',
    bankHolder1: 'امور مالی شرکت دخانیات سرو',
    bankCard2: '۵۸۹۲-۱۰۱۲-۳۴۵۶-۷۸۹۰',
    bankShiba2: 'IR۸۲۰۱۲۰۰۰۰۰۰۰۹۸۷۶۵۴۳۲۱۰۹۸',
    bankHolder2: 'حساب ترابری و تدارکات دخانیات سرو',
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

  // Split into pages (24 items per page for optimal fill)
  const ITEMS_PER_PAGE = 24;
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
        <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; height: 100%; display: flex; flex-direction: column; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, sans-serif; color: #0f172a; box-sizing: border-box; border: 2px solid #1d4ed8; border-radius: 12px; padding: 16px; background: #ffffff;">
          
          <div style="flex: 1;">
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
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; text-align: right; margin-bottom: 8px; direction: rtl;">
              <thead>
                <tr style="background: #1d4ed8; color: #ffffff; font-weight: bold;">
                  <th style="padding: 6px 4px; width: 5%; text-align: center; border: 1px solid #1d4ed8;">ردیف</th>
                  <th style="padding: 6px 6px; width: 33%; border: 1px solid #1d4ed8; text-align: right;">نام کالا و مارک</th>
                  <th style="padding: 6px 6px; width: 18%; text-align: center; border: 1px solid #1d4ed8;">مبدأ / هولوگرام</th>
                  <th style="padding: 6px 6px; width: 14%; text-align: center; border: 1px solid #1d4ed8;">بسته‌بندی</th>
                  <th style="padding: 6px 6px; width: 15%; text-align: left; border: 1px solid #1d4ed8;">نرخ باکس (تومان)</th>
                  <th style="padding: 6px 6px; width: 15%; text-align: left; font-weight: 900; border: 1px solid #1d4ed8;">نرخ کارتن (تومان)</th>
                </tr>
              </thead>
              <tbody>
                ${pageProducts.map((p, idx) => {
                  const globalIdx = pageIdx * ITEMS_PER_PAGE + idx + 1;
                  return `
                    <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="padding: 4px 4px; text-align: center; color: #64748b; border: 1px solid #e2e8f0;">${globalIdx}</td>
                      <td style="padding: 4px 6px; border: 1px solid #e2e8f0; text-align: right;">
                        <strong style="color: #0f172a; font-size: 9.5px;">${p.nameFa}</strong>
                        <div style="font-size: 8px; color: #64748b;">${p.nameEn || ''} • ${p.brand}</div>
                      </td>
                      <td style="padding: 4px 4px; text-align: center; color: #334155; border: 1px solid #e2e8f0; font-size: 8.5px;">${p.origin}</td>
                      <td style="padding: 4px 4px; text-align: center; color: #475569; border: 1px solid #e2e8f0; font-size: 8.5px;">${p.isBoxOnly ? 'تک باکس' : `${formatNumberFa(p.boxesPerCarton)} باکس`}</td>
                      <td style="padding: 4px 6px; text-align: left; font-weight: bold; color: #1e293b; border: 1px solid #e2e8f0; font-size: 9px;">${formatToman(p.boxPrice)}</td>
                      <td style="padding: 4px 6px; text-align: left; font-weight: 900; color: #1d4ed8; border: 1px solid #e2e8f0; font-size: 9.5px;">${p.cartonPrice > 0 ? formatToman(p.cartonPrice) : '—'}</td>
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

      await new Promise(r => setTimeout(r, 600));

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
          <table style="width: 100%; border-collapse: collapse; background: #0f172a; color: #ffffff; border-radius: 6px; margin-bottom: 10px; font-size: 9.5px; direction: rtl; text-align: center; overflow: hidden;">
            <tr>
              ${config.showNationalIdInvoice ? `
                <td style="padding: 7px 6px; border-left: 1px solid #334155; width: 25%; text-align: center; vertical-align: middle; white-space: nowrap;">
                  <span style="color: #94a3b8; font-size: 9px;">شناسه ملی:</span>
                  <span style="color: #ffffff; font-weight: bold; font-size: 10px; margin-right: 3px; display: inline-block;">${config.nationalIdCompany || '۱۰۱۰۳۸۵۲۹۱۰'}</span>
                </td>
              ` : ''}
              ${config.showEconomicCodeInvoice ? `
                <td style="padding: 7px 6px; border-left: 1px solid #334155; width: 25%; text-align: center; vertical-align: middle; white-space: nowrap;">
                  <span style="color: #94a3b8; font-size: 9px;">کد اقتصادی:</span>
                  <span style="color: #ffffff; font-weight: bold; font-size: 10px; margin-right: 3px; display: inline-block;">${config.economicCodeCompany || '۴۱۱۴۹۸۷۵۳۱۱۹'}</span>
                </td>
              ` : ''}
              ${config.showActivityTypeInvoice ? `
                <td style="padding: 7px 6px; border-left: 1px solid #334155; width: 25%; text-align: center; vertical-align: middle; white-space: nowrap;">
                  <span style="color: #94a3b8; font-size: 9px;">نوع فعالیت:</span>
                  <span style="color: #ffffff; font-weight: bold; font-size: 10px; margin-right: 3px; display: inline-block;">${config.activityTypeCompany || 'پخش عمده دخانیات'}</span>
                </td>
              ` : ''}
              ${config.showTransportPhoneInvoice ? `
                <td style="padding: 7px 6px; width: 25%; text-align: center; vertical-align: middle; white-space: nowrap;">
                  <span style="color: #94a3b8; font-size: 9px;">تلفن ترابری:</span>
                  <span style="color: #ffffff; font-weight: bold; font-size: 10px; margin-right: 3px; direction: ltr; display: inline-block;">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</span>
                </td>
              ` : ''}
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
    await new Promise(r => setTimeout(r, 600));

    const imgData = await toJpeg(printContainer, {
      quality: 0.96,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      width: 794,
      height: 1123,
      skipFonts: true,
      fontEmbedCSS: '',
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`پیش_فاکتور_${config.companyName}_${invoice.orderId}.pdf`);
      return true;
    } catch (saveErr) {
      console.warn('PDF save issue, falling back to downloadable printable file:', saveErr);
      fallbackDownloadInvoice(invoice, config);
      return true;
    }
  } catch (error) {
    console.error('Error generating Invoice PDF image, downloading printable document:', error);
    fallbackDownloadInvoice(invoice, config);
    return true;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Universal fallback: Generates and downloads a self-contained, high-resolution printable HTML/PDF document.
 */
function fallbackDownloadInvoice(invoice: OrderInvoice, config: any) {
  const trackingCode = invoice.trackingCode || invoice.orderId;
  const printableHtml = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>پیش‌فاکتور رسمی ${invoice.orderId} - پخش دخانیات ${config.companyName}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Tahoma, 'Vazirmatn', -apple-system, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 20px;
      direction: rtl;
    }
    .invoice-card {
      background: #ffffff;
      border: 2px solid #1d4ed8;
      border-radius: 12px;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    table { width: 100%; border-collapse: collapse; }
    .header-table td { vertical-align: top; }
    .title { font-size: 18px; font-weight: 900; color: #1e3a8a; }
    .subtitle { font-size: 12px; color: #475569; font-weight: bold; margin-top: 4px; }
    .cred-bar { background: #0f172a; color: #ffffff; padding: 8px 12px; border-radius: 8px; font-size: 11px; margin: 16px 0; }
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; font-size: 12px; margin-bottom: 16px; }
    .items-table { font-size: 12px; margin-bottom: 16px; }
    .items-table th { background: #1d4ed8; color: #ffffff; padding: 10px 8px; border: 1px solid #1d4ed8; }
    .items-table td { padding: 8px; border: 1px solid #e2e8f0; }
    .totals-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; }
    .totals-box td { padding: 8px 12px; }
    .grand-total { font-weight: 900; color: #1d4ed8; font-size: 14px; background: #dbeafe; }
    .footer-terms { font-size: 11px; color: #475569; line-height: 1.8; }
    .signatures { margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 12px; text-align: center; }
    .print-btn {
      display: block;
      width: 100%;
      max-width: 800px;
      margin: 0 auto 16px auto;
      padding: 12px;
      background: #1d4ed8;
      color: #fff;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    }
    @media print {
      .print-btn { display: none !important; }
      body { padding: 0; background: #fff; }
      .invoice-card { box-shadow: none; border: 1px solid #000; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ چاپ یا ذخیره PDF پیش‌فاکتور (کلیک کنید)</button>
  <div class="invoice-card">
    <table class="header-table">
      <tr>
        <td style="text-align: right;">
          <div class="title">صورتحساب فروش کالا و خدمات (پیش‌فاکتور رسمی)</div>
          <div class="subtitle">سامانه پخش سراسری دخانیات ${config.companyName}</div>
          <div style="font-size: 11px; margin-top: 4px; color: #334155;">تلفن ترابری و تدارکات: <strong dir="ltr">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong></div>
        </td>
        <td style="text-align: left; width: 220px; font-size: 12px; line-height: 1.8;">
          <div><strong>شماره فاکتور:</strong> ${invoice.orderId}</div>
          <div><strong>کد رهگیری:</strong> ${trackingCode}</div>
          <div><strong>تاریخ صدور:</strong> ${invoice.createdAt}</div>
          <div><strong>وضعیت:</strong> ${invoice.paymentStatus}</div>
        </td>
      </tr>
    </table>

    <div class="cred-bar">
      <span>شناسه ملی: <strong>${config.nationalIdCompany || '۱۰۱۰۳۸۵۲۹۱۰'}</strong></span> &nbsp;|&nbsp;
      <span>کد اقتصادی: <strong>${config.economicCodeCompany || '۴۱۱۴۹۸۷۵۳۱۱۹'}</strong></span> &nbsp;|&nbsp;
      <span>نوع فعالیت: <strong>${config.activityTypeCompany || 'پخش عمده دخانیات'}</strong></span>
    </div>

    <div class="info-box">
      <table>
        <tr>
          <td style="width: 50%; vertical-align: top; line-height: 1.8;">
            <div><strong>خریدار / بنکدار:</strong> ${invoice.customer.shopOwnerName}</div>
            <div><strong>نام فروشگاه:</strong> ${invoice.customer.shopName || '—'}</div>
            <div><strong>شماره تماس:</strong> <span dir="ltr">${invoice.customer.shopPhone}</span></div>
          </td>
          <td style="width: 50%; vertical-align: top; line-height: 1.8;">
            <div><strong>شهر مقصد:</strong> ${invoice.customer.city}</div>
            <div><strong>روش ارسال:</strong> ${invoice.customer.shippingMethod}</div>
            <div><strong>آدرس:</strong> ${invoice.customer.address}</div>
          </td>
        </tr>
      </table>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 6%;">ردیف</th>
          <th style="text-align: right; width: 40%;">شرح کالا و برند</th>
          <th style="width: 14%;">واحد</th>
          <th style="width: 10%;">تعداد</th>
          <th style="width: 15%; text-align: left;">نرخ واحد (تومان)</th>
          <th style="width: 15%; text-align: left;">مبلغ کل (تومان)</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item, idx) => {
          const unitPrice = item.unit === 'carton' ? item.product.cartonPrice : item.product.boxPrice;
          const itemTotal = unitPrice * item.quantity;
          return `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td><strong>${item.product.nameFa}</strong><div style="font-size: 10px; color: #64748b;">${item.product.brand} - ${item.product.origin}</div></td>
              <td style="text-align: center;">${item.unit === 'carton' ? `کارتن (${item.product.boxesPerCarton} باکسی)` : 'باکس (۱۰ تایی)'}</td>
              <td style="text-align: center; font-weight: bold;">${formatNumberFa(item.quantity)}</td>
              <td style="text-align: left;">${formatToman(unitPrice)}</td>
              <td style="text-align: left; font-weight: bold; color: #1d4ed8;">${formatToman(itemTotal)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <table>
      <tr>
        <td class="footer-terms" style="vertical-align: top;">
          <div style="font-weight: bold; color: #1e3a8a; margin-bottom: 4px;">قوانین و شرایط تحویل بار:</div>
          <div>• کلیه بارها با بسته‌بندی پلمپ شرکتی و هولوگرام تضمین اصالت ارسال می‌گردد.</div>
          <div>• تسویه فقط از طریق فیش واریز بانکی / حواله پایا و ساتنا انجام می‌پذیرد.</div>
          <div>• هماهنگی ترابری و صدور بیجک: <strong>${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong></div>
        </td>
        <td style="width: 280px; vertical-align: top;">
          <table class="totals-box">
            <tr>
              <td>تعداد کارتن:</td>
              <td style="text-align: left; font-weight: bold;">${formatNumberFa(invoice.totalCartons)} کارتن</td>
            </tr>
            <tr>
              <td>جمع اقلام:</td>
              <td style="text-align: left; font-weight: bold;">${formatToman(invoice.subtotal)}</td>
            </tr>
            ${invoice.discountAmount > 0 ? `
              <tr>
                <td style="color: #047857; font-weight: bold;">تخفیف تیراژ:</td>
                <td style="text-align: left; color: #047857; font-weight: bold;">-${formatToman(invoice.discountAmount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>هزینه ارسال:</td>
              <td style="text-align: left; font-weight: bold;">${invoice.shippingCost > 0 ? formatToman(invoice.shippingCost) : 'تحویل انبار (رایگان)'}</td>
            </tr>
            <tr class="grand-total">
              <td>مبلغ نهایی:</td>
              <td style="text-align: left;">${formatToman(invoice.finalTotal)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="signatures">
      <tr>
        <td style="width: 50%;">
          <strong>امضاء و مهر مدیریت پخش دخانیات ${config.companyName}</strong>
          <div style="margin-top: 30px; color: #94a3b8;">...................................</div>
        </td>
        <td style="width: 50%;">
          <strong>امضاء و تأیید خریدار / بنکدار</strong>
          <div style="margin-top: 30px; color: #94a3b8;">...................................</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `پیش_فاکتور_${config.companyName}_${invoice.orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Downloads an official, beautifully styled receipt/invoice PDF for in-person / POS sales with zero overflow.
 */
export async function generatePosThermalReceiptPdf(receipt: PosReceiptInvoice): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-pos-invoice-receipt';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';

  // 420px container width for high crisp resolution
  const containerWidthPx = 420;
  // Calculate dynamic height based on number of items with generous spacing to avoid any text overlap
  const baseHeightPx = 520;
  const itemsHeightPx = Math.max(1, receipt.items.length) * 62;
  const notesHeightPx = receipt.notes ? 45 : 0;
  const totalHeightPx = baseHeightPx + itemsHeightPx + notesHeightPx;

  // 80mm width standard receipt roll. Height scaled proportionally in mm
  const receiptWidthMm = 80;
  const receiptHeightMm = Math.max(140, Math.round((receiptWidthMm * totalHeightPx) / containerWidthPx));

  printContainer.style.width = `${containerWidthPx}px`;
  printContainer.style.minHeight = `${totalHeightPx}px`;
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '20px 18px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.direction = 'rtl';
  printContainer.style.pointerEvents = 'none';

  const paymentMethodText = 
    receipt.paymentMethod === 'pos_terminal' ? 'کارتخوان بانکی' :
    receipt.paymentMethod === 'cash' ? 'پرداخت نقدی' :
    receipt.paymentMethod === 'ledger' ? 'حساب دفتری (نسیه)' :
    receipt.paymentMethod === 'split' ? 'ترکیبی (نقد + کارت)' : 'کارتخوان بانکی';

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; background: #ffffff; box-sizing: border-box; font-size: 11px; line-height: 1.6;">
      
      <!-- Receipt Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; text-align: center;">
        <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.5px;">
          ${config.companyName ? `فروشگاه و بنکداری ${config.companyName}` : 'فروشگاه و پخش سراسری دخانیات سرو'}
        </div>
        <div style="display: inline-block; white-space: nowrap; font-size: 11px; font-weight: 800; color: #1e293b; background: #f1f5f9; padding: 3px 14px; border-radius: 6px; margin-bottom: 4px; border: 1px solid #cbd5e1;">
          فاکتور رسمی فروش و تحویل کالا
        </div>
        <div style="font-size: 10px; color: #475569; margin-top: 4px;">
          تلفن هماهنگی و سفارشات: <strong style="color: #0f172a;">${config.transportPhoneCompany || '۰۹۱۲۰۷۵۹۴۱۹'}</strong>
        </div>
      </div>

      <!-- Receipt Metadata Table (Guaranteed Zero Overlap) -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; font-size: 10.5px;">
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 10.5px; line-height: 1.8;">
          <tr style="border-bottom: 1px dashed #cbd5e1;">
            <td style="padding: 3px 0; text-align: right; width: 50%; white-space: nowrap;">
              <span style="color: #64748b; font-weight: 600;">شماره فاکتور:</span> 
              <strong style="font-family: monospace; font-size: 11.5px; color: #0f172a; margin-right: 4px;">${receipt.receiptNumber}</strong>
            </td>
            <td style="padding: 3px 0; text-align: left; width: 50%; white-space: nowrap;">
              <span style="color: #64748b; font-weight: 600;">تاریخ:</span> 
              <strong style="color: #0f172a; margin-right: 4px;">${receipt.createdAt}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 0 2px; text-align: right; width: 55%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              <span style="color: #64748b; font-weight: 600;">مشتری / خریدار:</span> 
              <strong style="color: #0f172a; margin-right: 4px;">${receipt.customerName || 'مشتری حضوری فروشگاه'}</strong>
            </td>
            <td style="padding: 4px 0 2px; text-align: left; width: 45%; white-space: nowrap;">
              <span style="color: #64748b; font-weight: 600;">روش پرداخت:</span> 
              <strong style="color: #1e40af; margin-right: 4px;">${paymentMethodText}</strong>
            </td>
          </tr>
          ${receipt.terminalRefNumber ? `
          <tr style="border-top: 1px dashed #e2e8f0;">
            <td colspan="2" style="padding: 3px 0 0; text-align: right; white-space: nowrap; color: #475569; font-size: 10px;">
              <span>شماره پیگیری کارتخوان:</span> 
              <strong style="font-family: monospace; color: #0f172a; margin-right: 4px;">${receipt.terminalRefNumber}</strong>
            </td>
          </tr>` : ''}
          ${receipt.cashier ? `
          <tr>
            <td colspan="2" style="padding: 2px 0 0; text-align: right; white-space: nowrap; color: #64748b; font-size: 9.5px;">
              <span>صندوق‌دار: ${receipt.cashier}</span>
            </td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; text-align: right; margin-bottom: 14px; direction: rtl;">
        <thead>
          <tr style="border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a; background: #f1f5f9; font-weight: 900; color: #0f172a;">
            <th style="padding: 7px 4px; text-align: right; width: 44%;">شرح کالا</th>
            <th style="padding: 7px 4px; text-align: center; width: 18%;">تعداد</th>
            <th style="padding: 7px 4px; text-align: left; width: 18%;">فی (تومان)</th>
            <th style="padding: 7px 4px; text-align: left; width: 20%;">جمع (تومان)</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items.map((item, idx) => {
            const unitLabel = item.unit === 'carton' ? 'کارتن' : item.unit === 'box' ? 'باکس' : item.unit === 'pack' ? 'پاکت' : item.unit === 'item' ? 'عدد' : 'واحد';
            return `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
                <td style="padding: 7px 4px; text-align: right; font-weight: 700; font-size: 10px; line-height: 1.35; color: #0f172a;">
                  ${item.product.nameFa}
                </td>
                <td style="padding: 7px 4px; text-align: center; font-size: 10px; white-space: nowrap; color: #334155; font-weight: 700;">
                  ${formatNumberFa(item.quantity)} ${unitLabel}
                </td>
                <td style="padding: 7px 4px; text-align: left; font-size: 10px; white-space: nowrap; color: #334155;">
                  ${formatNumberFa(item.unitPrice)}
                </td>
                <td style="padding: 7px 4px; text-align: left; font-weight: 800; font-size: 10.5px; white-space: nowrap; color: #0f172a;">
                  ${formatNumberFa(item.totalPrice)}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Totals & Financial Summary Box (No Overlapping Text, Single Toman) -->
      <div style="background: #f8fafc; border: 1.5px solid #0f172a; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 11.5px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 0; color: #334155; white-space: nowrap;">
          <span style="font-weight: 600;">جمع کل اقلام فاکتور:</span>
          <span style="font-weight: 800; font-size: 12px; color: #0f172a;">${formatToman(receipt.subtotal)}</span>
        </div>
        
        ${receipt.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 3px 0; color: #059669; white-space: nowrap;">
            <span style="font-weight: 700;">مبلغ تخفیف اعطایی:</span>
            <span style="font-weight: 800; font-size: 12px;">-${formatToman(receipt.discountAmount)}</span>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 9px; border-top: 1.5px dashed #0f172a; white-space: nowrap;">
          <span style="font-size: 12.5px; font-weight: 900; color: #0f172a;">مبلغ نهایی قابل پرداخت:</span>
          <span style="font-size: 13.5px; font-weight: 900; color: #0f172a;">${formatToman(receipt.finalTotal)}</span>
        </div>
      </div>

      ${receipt.notes ? `
        <div style="font-size: 9.5px; color: #475569; margin-bottom: 14px; padding: 7px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; line-height: 1.45;">
          <strong>توضیحات:</strong> ${receipt.notes}
        </div>
      ` : ''}

      <!-- Receipt Footer Barcode & Official Seal -->
      <div style="border-top: 1.5px dashed #cbd5e1; padding-top: 12px; text-align: center; font-size: 10px; color: #475569;">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 4px;">با سپاس از خرید و اعتماد شما</div>
        <div style="font-family: monospace; font-size: 17px; letter-spacing: 4px; font-weight: 900; color: #0f172a; margin-bottom: 2px;">
          ||||| ||||||| ||||| ||||
        </div>
        <div style="font-family: monospace; font-size: 9.5px; letter-spacing: 1px; color: #64748b; font-weight: bold;">
          ${receipt.receiptNumber}
        </div>
        <div style="font-size: 8.5px; color: #94a3b8; margin-top: 5px;">
          سند معتبر الکترونیکی فروشگاه و بنکداری دخانیات سرو
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 600));

    const actualWidthPx = printContainer.offsetWidth || containerWidthPx;
    const actualHeightPx = printContainer.offsetHeight || totalHeightPx;
    const receiptActualHeightMm = Math.max(120, (actualHeightPx / actualWidthPx) * receiptWidthMm);

    const imgData = await toPng(printContainer, {
      quality: 0.98,
      backgroundColor: '#ffffff',
      pixelRatio: 2.5,
      width: actualWidthPx,
      height: actualHeightPx,
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const pdf = new jsPDF('p', 'mm', [receiptWidthMm, receiptActualHeightMm]);
    pdf.addImage(imgData, 'PNG', 0, 0, receiptWidthMm, receiptActualHeightMm);
    pdf.save(`فاکتور_فروش_${receipt.receiptNumber}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Invoice Receipt PDF:', error);
    window.print();
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

export const generateThermalReceiptPdf = generatePosThermalReceiptPdf;
export const generatePosInvoicePdf = generatePosThermalReceiptPdf;

/**
 * Downloads an official Monthly Sales Report PDF with Carton/Box/Pack units breakdown.
 */
export async function generateMonthlyReportPdf(monthData: any, daysInMonth: any[]): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-monthly-report-container';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.width = '794px';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '20px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.direction = 'rtl';
  printContainer.style.pointerEvents = 'none';

  const totalCartons = monthData.cartonsSold || 0;
  const totalBoxes = monthData.boxesSold || Math.round(totalCartons * 50);
  const totalPacks = monthData.packsSold || Math.round(totalBoxes * 10);

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; border: 2px solid #7e22ce; border-radius: 12px; padding: 20px; background: #fff; box-sizing: border-box;">
      <div style="text-align: center; border-bottom: 2px solid #e9d5ff; padding-bottom: 14px; margin-bottom: 18px;">
        <h2 style="color: #7e22ce; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">گزارش جامع عملکرد ماهانه (${monthData.monthName})</h2>
        <div style="font-size: 11.5px; color: #64748b;">سامانه بنکداری و حسابداری ${config.companyName} | گزارش تفکیکی کارتن، باکس و پاکت</div>
      </div>
      
      <!-- Key Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
        <div style="padding: 10px 12px; border: 1px solid #d8b4fe; border-radius: 8px; background: #faf5ff;">
          <div style="font-size: 10.5px; color: #6b21a8; font-weight: 700; margin-bottom: 4px;">فروش کل ماه:</div>
          <div style="font-size: 13.5px; font-weight: 900; color: #581c87;">${formatToman(monthData.totalSales)}</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #eff6ff;">
          <div style="font-size: 10.5px; color: #1e40af; font-weight: 700; margin-bottom: 4px;">حجم فروش کارتن:</div>
          <div style="font-size: 13px; font-weight: 900; color: #1e3a8a;">${totalCartons.toLocaleString('fa-IR')} کارتن</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #fed7aa; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 10.5px; color: #c2410c; font-weight: 700; margin-bottom: 4px;">حجم فروش باکس:</div>
          <div style="font-size: 13px; font-weight: 900; color: #9a3412;">${totalBoxes.toLocaleString('fa-IR')} باکس</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #bbf7d0; border-radius: 8px; background: #f0fdf4;">
          <div style="font-size: 10.5px; color: #15803d; font-weight: 700; margin-bottom: 4px;">حجم فروش پاکت:</div>
          <div style="font-size: 13px; font-weight: 900; color: #166534;">${totalPacks.toLocaleString('fa-IR')} پاکت</div>
        </div>
      </div>

      <h3 style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">ریز فروش و گردش روزانه در این ماه:</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 10.5px;">
        <thead style="background: #7e22ce; color: #fff;">
          <tr>
            <th style="padding: 8px 6px; border: 1px solid #7e22ce; text-align: right;">تاریخ</th>
            <th style="padding: 8px 6px; border: 1px solid #7e22ce; text-align: center;">فاکتورها</th>
            <th style="padding: 8px 6px; border: 1px solid #7e22ce; text-align: left;">کارتخوان POS</th>
            <th style="padding: 8px 6px; border: 1px solid #7e22ce; text-align: left;">نقدی و دفتری</th>
            <th style="padding: 8px 6px; border: 1px solid #7e22ce; text-align: left;">مجموع فروش روز (تومان)</th>
          </tr>
        </thead>
        <tbody>
          ${daysInMonth.map((d: any, idx: number) => `
            <tr style="background: ${idx % 2 === 0 ? '#fff' : '#faf5ff'}; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">${d.date}</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: center; color: #334155;">${d.receipts?.length || 0} فاکتور</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: left; color: #2563eb; font-weight: 600;">${formatToman(d.posSales)}</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: left; color: #059669; font-weight: 600;">${formatToman(d.cashSales + d.ledgerSales)}</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: left; font-weight: 800; color: #7e22ce;">${formatToman(d.totalSales)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 500));
    
    const containerWidth = printContainer.offsetWidth || 794;
    const containerHeight = printContainer.offsetHeight || 600;

    const imgData = await toPng(printContainer, { 
      quality: 0.98, 
      backgroundColor: '#ffffff', 
      pixelRatio: 2.5, 
      width: containerWidth,
      height: containerHeight,
      skipFonts: true 
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const marginMm = 8;
    const printWidthMm = 210 - (marginMm * 2);
    const printHeightMm = (containerHeight / containerWidth) * printWidthMm;

    pdf.addImage(imgData, 'PNG', marginMm, marginMm, printWidthMm, printHeightMm);
    pdf.save(`گزارش_ماهانه_${monthData.monthName.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Monthly Report PDF:', error);
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Downloads an official Annual Sales Summary Report PDF with natural proportions and Carton/Box/Pack breakdown.
 */
export async function generateAnnualReportPdf(monthlyRecords: any[]): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-annual-report-container';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.width = '794px';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '20px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.direction = 'rtl';
  printContainer.style.pointerEvents = 'none';

  const totalAnnualSales = monthlyRecords.reduce((acc, r) => acc + (r.totalSales || 0), 0);
  const totalAnnualProfit = monthlyRecords.reduce((acc, r) => acc + (r.totalProfit || 0), 0);
  const totalCartons = monthlyRecords.reduce((acc, r) => acc + (r.cartonsSold || 0), 0);
  const totalBoxes = monthlyRecords.reduce((acc, r) => acc + (r.boxesSold || Math.round((r.cartonsSold || 0) * 50)), 0);
  const totalPacks = monthlyRecords.reduce((acc, r) => acc + (r.packsSold || Math.round((r.boxesSold || (r.cartonsSold || 0) * 50) * 10)), 0);

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; border: 2px solid #1e3a8a; border-radius: 12px; padding: 20px; background: #ffffff; box-sizing: border-box;">
      
      <!-- Report Header -->
      <div style="text-align: center; border-bottom: 2px solid #dbeafe; padding-bottom: 14px; margin-bottom: 18px;">
        <h2 style="color: #1e3a8a; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">گزارش رسمی و تحلیلی عملکرد سالانه بنکداری و پخش</h2>
        <div style="font-size: 11.5px; color: #64748b;">سامانه جامع مدیریت، انبارداری و حسابداری ${config.companyName} | تفکیک فروش کارتن، باکس و پاکت</div>
      </div>

      <!-- High-Level Metric Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
        <div style="padding: 10px 12px; border: 1px solid #bfdbfe; border-radius: 8px; background: #eff6ff; text-align: right;">
          <div style="font-size: 10.5px; color: #1e40af; font-weight: 700; margin-bottom: 4px;">فروش کل سال:</div>
          <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">${formatToman(totalAnnualSales)}</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #a7f3d0; border-radius: 8px; background: #ecfdf5; text-align: right;">
          <div style="font-size: 10.5px; color: #065f46; font-weight: 700; margin-bottom: 4px;">سود ناخالص کل:</div>
          <div style="font-size: 14px; font-weight: 900; color: #047857;">${formatToman(totalAnnualProfit)}</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #e9d5ff; border-radius: 8px; background: #faf5ff; text-align: right;">
          <div style="font-size: 10.5px; color: #7e22ce; font-weight: 700; margin-bottom: 4px;">مجموع توزیع کارتن:</div>
          <div style="font-size: 13.5px; font-weight: 900; color: #6b21a8;">${totalCartons.toLocaleString('fa-IR')} کارتن</div>
        </div>
        <div style="padding: 10px 12px; border: 1px solid #fed7aa; border-radius: 8px; background: #fff7ed; text-align: right;">
          <div style="font-size: 10.5px; color: #9a3412; font-weight: 700; margin-bottom: 4px;">توزیع باکس و پاکت:</div>
          <div style="font-size: 11.5px; font-weight: 900; color: #c2410c;">${totalBoxes.toLocaleString('fa-IR')} باکس / ${totalPacks.toLocaleString('fa-IR')} پاکت</div>
        </div>
      </div>

      <!-- Comparative Monthly Table (Carton - Box - Pack) -->
      <h3 style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">جدول جامع آماری ماه‌های سال (تفکیک فروش کارتن، باکس و پاکت):</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 11px;">
        <thead style="background: #1e3a8a; color: #ffffff;">
          <tr>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: right; font-weight: 800;">ماه / دوره مالی</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: left; font-weight: 800;">فروش کل (تومان)</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: center; font-weight: 800;">کارتن</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: center; font-weight: 800;">باکس</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: center; font-weight: 800;">پاکت</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: left; font-weight: 800;">سود ناخالص (تومان)</th>
            <th style="padding: 9px 8px; border: 1px solid #1e3a8a; text-align: center; font-weight: 800;">رشد (MoM)</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRecords.map((m: any, idx: number) => {
            const cartons = m.cartonsSold || 0;
            const boxes = m.boxesSold || Math.round(cartons * 50);
            const packs = m.packsSold || Math.round(boxes * 10);
            return `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 800; color: #0f172a;">${m.monthName}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; color: #1e3a8a;">${formatToman(m.totalSales)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #334155;">${formatNumberFa(cartons)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #334155;">${formatNumberFa(boxes)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #334155;">${formatNumberFa(packs)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: left; font-weight: 800; color: #059669;">${formatToman(m.totalProfit)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: ${(m.growthRatePercent || 0) >= 0 ? '#059669' : '#dc2626'};">${(m.growthRatePercent || 0) >= 0 ? '+' : ''}${m.growthRatePercent || 0}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 500));
    
    const containerWidth = printContainer.offsetWidth || 794;
    const containerHeight = printContainer.offsetHeight || 600;

    const imgData = await toPng(printContainer, { 
      quality: 0.98, 
      backgroundColor: '#ffffff', 
      pixelRatio: 2.5, 
      width: containerWidth,
      height: containerHeight,
      skipFonts: true 
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const marginMm = 8;
    const printWidthMm = 210 - (marginMm * 2);
    const printHeightMm = (containerHeight / containerWidth) * printWidthMm;

    pdf.addImage(imgData, 'PNG', marginMm, marginMm, printWidthMm, printHeightMm);
    pdf.save(`گزارش_سالانه_عملکرد_${config.companyName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Annual Report PDF:', error);
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

/**
 * Downloads an official Daily Sales Summary Report PDF.
 */
export async function generateDailyReportPdf(dayData: any): Promise<boolean> {
  const config = getDjangoConfig();
  const printContainer = document.createElement('div');
  printContainer.id = 'pdf-daily-report-container';
  printContainer.style.position = 'fixed';
  printContainer.style.left = '0px';
  printContainer.style.top = '0px';
  printContainer.style.zIndex = '-9999';
  printContainer.style.width = '794px';
  printContainer.style.backgroundColor = '#ffffff';
  printContainer.style.padding = '20px';
  printContainer.style.boxSizing = 'border-box';
  printContainer.style.direction = 'rtl';
  printContainer.style.pointerEvents = 'none';

  printContainer.innerHTML = `
    <div dir="rtl" style="direction: rtl; text-align: right; width: 100%; font-family: 'Samim', 'Vazirmatn', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; border: 2px solid #047857; border-radius: 12px; padding: 20px; background: #fff; box-sizing: border-box;">
      <div style="text-align: center; border-bottom: 2px solid #d1fae5; padding-bottom: 14px; margin-bottom: 18px;">
        <h2 style="color: #047857; font-size: 20px; font-weight: 900; margin: 0 0 6px 0;">گزارش روزانه صندوق و فروش (${dayData.date})</h2>
        <div style="font-size: 11.5px; color: #64748b;">سامانه صندوق و فروش حضوری ${config.companyName}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 11px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #cbd5e1; background: #ecfdf5;"><strong>مجموع فروش روز:</strong> ${formatToman(dayData.totalSales)}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; background: #eff6ff;"><strong>کارتخوان POS:</strong> ${formatToman(dayData.posSales)}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; background: #fef3c7;"><strong>تعداد فاکتورها:</strong> ${dayData.receipts?.length || 0} فاکتور</td>
        </tr>
      </table>
      <h3 style="font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">لیست فاکتورهای ثبت شده در این روز:</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 10.5px;">
        <thead style="background: #047857; color: #fff;">
          <tr>
            <th style="padding: 8px 6px; border: 1px solid #047857;">شماره فاکتور</th>
            <th style="padding: 8px 6px; border: 1px solid #047857;">مشتری</th>
            <th style="padding: 8px 6px; border: 1px solid #047857; text-align: center;">روش پرداخت</th>
            <th style="padding: 8px 6px; border: 1px solid #047857; text-align: left;">مبلغ کل (تومان)</th>
          </tr>
        </thead>
        <tbody>
          ${(dayData.receipts || []).map((rcpt: any, idx: number) => `
            <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f0fdf4'}; border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 7px 6px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${rcpt.receiptNumber}</td>
              <td style="padding: 7px 6px; border: 1px solid #e2e8f0;">${rcpt.customerName || 'مشتری حضوری'}</td>
              <td style="padding: 7px 6px; border: 1px solid #e2e8f0; text-align: center;">${rcpt.paymentMethod}</td>
              <td style="padding: 7px 6px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #047857;">${formatToman(rcpt.finalTotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(printContainer);

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise(r => setTimeout(r, 500));
    
    const containerWidth = printContainer.offsetWidth || 794;
    const containerHeight = printContainer.offsetHeight || 600;

    const imgData = await toPng(printContainer, { 
      quality: 0.98, 
      backgroundColor: '#ffffff', 
      pixelRatio: 2.5, 
      width: containerWidth,
      height: containerHeight,
      skipFonts: true 
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const marginMm = 8;
    const printWidthMm = 210 - (marginMm * 2);
    const printHeightMm = (containerHeight / containerWidth) * printWidthMm;

    pdf.addImage(imgData, 'PNG', marginMm, marginMm, printWidthMm, printHeightMm);
    pdf.save(`گزارش_روزانه_${dayData.date.replace(/\//g, '-')}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating Daily Report PDF:', error);
    return false;
  } finally {
    if (document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
}

