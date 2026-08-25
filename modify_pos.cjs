const fs = require('fs');
let code = fs.readFileSync('src/components/shopmanage/AccountingPosPanel.tsx', 'utf8');

// 1. Add packs to unit selections
code = code.replace(/<option value="carton">کارتن<\/option>\s*<option value="box">باکس<\/option>/g, '<option value="carton">کارتن</option><option value="box">باکس</option><option value="pack">پاکت</option>');

// Update unit label function or instances
code = code.replace(/it.unit === 'carton' \? 'کارتن' : 'باکس'/g, "it.unit === 'carton' ? 'کارتن' : (it.unit === 'box' ? 'باکس' : 'پاکت')");
code = code.replace(/item.unit === 'carton' \? 'کارتن' : 'باکس'/g, "item.unit === 'carton' ? 'کارتن' : (item.unit === 'box' ? 'باکس' : 'پاکت')");

// 2. Add Ledger and Reports Tabs
code = code.replace(
  /const \[activeSubTab, setActiveSubTab\] = useState.*$/m,
  "const [activeSubTab, setActiveSubTab] = useState<'pos' | 'inventory' | 'ledger' | 'customers' | 'reports'>('pos');\n  const [posCustomers, setPosCustomers] = useState<any[]>([]);"
);

// 3. Fix activeReceiptToPrint to print properly
code = code.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900\/60 backdrop-blur-sm animate-in fade-in">/g,
  '<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in print:bg-white print:p-0">'
);
code = code.replace(
  /<div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl">/g,
  '<div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">'
);
code = code.replace(
  /{activeReceiptToPrint.paymentMethod === 'pos_terminal' \? 'کارتخوان' : 'نقدی'}/g,
  "{activeReceiptToPrint.paymentMethod === 'pos_terminal' ? 'کارتخوان' : (activeReceiptToPrint.paymentMethod === 'cash' ? 'نقدی' : 'حساب دفتری')}"
);

// Buttons should be hidden in print
code = code.replace(
  /<div className="mt-4 flex items-center gap-2">/g,
  '<div className="mt-4 flex items-center gap-2 print:hidden">'
);

// Make the main wrapper print:hidden
code = code.replace(
  /<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white" dir="rtl">/g,
  '<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white print:hidden" dir="rtl">'
);
// But wait! If the main wrapper is print:hidden, and the modal is inside it, the modal will also be hidden!
// So instead of putting print:hidden on the main wrapper, we put it on the header and main tags!
code = code.replace(
  /<header className="bg-white\/95/g,
  '<header className="bg-white/95 print:hidden'
);
code = code.replace(
  /<main className="flex-1/g,
  '<main className="flex-1 print:hidden'
);
code = code.replace(
  /<div className="bg-white border-b border-slate-200 px-4 sm:px-8 pt-6">/g,
  '<div className="bg-white border-b border-slate-200 px-4 sm:px-8 pt-6 print:hidden">'
);

// Payment method selector
code = code.replace(
  /<option value="pos_terminal">کارتخوان \(POS\)<\/option>\s*<option value="cash">نقدی<\/option>/g,
  '<option value="pos_terminal">کارتخوان (POS)</option><option value="cash">نقدی</option><option value="ledger">حساب دفتری / نسیه</option>'
);

// Add framer-motion animations
code = code.replace(
  /import { motion, AnimatePresence } from "framer-motion";/g,
  'import { motion, AnimatePresence } from "framer-motion";\nimport { Users, PieChart, FileText } from "lucide-react";'
);

fs.writeFileSync('src/components/shopmanage/AccountingPosPanel.tsx', code);
console.log('Modifications applied');
