import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  FileCode,
  Eye,
  Type,
  Palette,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { formatNumberFa } from '../../utils/formatters';

interface TinyMceEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: string;
  onWordCountChange?: (wordCount: number, readingMinutes: number) => void;
}

export const TinyMceEditor: React.FC<TinyMceEditorProps> = ({
  value,
  onChange,
  placeholder = 'متن مقاله را اینجا تایپ و ویرایش کنید...',
  minHeight = '320px',
  onWordCountChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [currentBlock, setCurrentBlock] = useState('Paragraph');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const savedSelectionRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (typeof window !== 'undefined' && window.getSelection && savedSelectionRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRangeRef.current);
      }
    }
  };

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
        updateStats();
      }
    }
  }, [value, isSourceMode]);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;
    setWordCount(words);
    setCharCount(chars);
    const readingTime = Math.max(1, Math.ceil(words / 150));
    if (onWordCountChange) {
      onWordCountChange(words, readingTime);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      setSourceCode(html);
      updateStats();
      saveSelection();
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      try {
        document.execCommand('styleWithCSS', false, 'true');
      } catch {}
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const applyTextColor = (color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      try {
        document.execCommand('styleWithCSS', false, 'true');
      } catch {}
      document.execCommand('foreColor', false, color);
      handleInput();
      setShowColorPicker(false);
    }
  };

  const handleFormatBlock = (tag: string, label: string) => {
    executeCommand('formatBlock', tag);
    setCurrentBlock(label);
    setShowHeadingMenu(false);
  };

  const openLinkModal = () => {
    saveSelection();
    let selectedStr = '';
    if (typeof window !== 'undefined' && window.getSelection) {
      selectedStr = window.getSelection()?.toString() || '';
    }
    setLinkText(selectedStr);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const cleanUrl = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://') || linkUrl.trim().startsWith('/') || linkUrl.trim().startsWith('#')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      
      const sel = window.getSelection();
      const textToUse = (linkText || (sel?.toString() || '')).trim() || cleanUrl;

      const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 700;">${textToUse}</a>`;
      
      try {
        document.execCommand('insertHTML', false, linkHtml);
      } catch {
        document.execCommand('createLink', false, cleanUrl);
      }
      handleInput();
    }
    
    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleInsertTable = (rows = 3, cols = 3) => {
    let tableHtml = '<table class="w-full border-collapse border border-slate-300 my-4 text-xs"><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          tableHtml += `<th class="border border-slate-300 p-2 bg-slate-100 font-black text-slate-800">سرستون ${c + 1}</th>`;
        } else {
          tableHtml += `<td class="border border-slate-300 p-2 text-slate-700">داده ردیف ${r}</td>`;
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';
    executeCommand('insertHTML', tableHtml);
  };

  const handleToggleSource = () => {
    if (isSourceMode) {
      // Switching from source to WYSIWYG
      setIsSourceMode(false);
      onChange(sourceCode);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = sourceCode;
          updateStats();
        }
      }, 50);
    } else {
      // Switching to Source Code
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const COLORS = [
    '#0f172a', '#1e293b', '#2563eb', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#0891b2', '#4b5563', '#9333ea', '#ea580c'
  ];

  return (
    <div className={`border border-slate-300 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col font-sans transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
    }`}>
      
      {/* TINYMCE CLASSIC MENUBAR */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs select-none flex-wrap gap-1">
        <div className="flex items-center gap-1 text-slate-700 font-bold">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black mr-1">
            <span>TinyMCE 6</span>
            <Sparkles className="w-3 h-3" />
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className="px-2 py-1 rounded-md hover:bg-slate-200 text-slate-700"
            >
              فایل
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    executeCommand('selectAll');
                    executeCommand('delete');
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-red-600 font-medium"
                >
                  سند جدید (خالی کردن)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    window.print();
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  چاپ پیش‌نویس
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className="px-2 py-1 rounded-md hover:bg-slate-200 text-slate-700"
            >
              ویرایش
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { executeCommand('undo'); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  بازگردانی (Undo)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { executeCommand('redo'); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  تکرار (Redo)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { executeCommand('selectAll'); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  انتخاب همه
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
              className="px-2 py-1 rounded-md hover:bg-slate-200 text-slate-700"
            >
              درج
            </button>
            {activeMenu === 'insert' && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { openLinkModal(); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> درج پیوند (لینک)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { handleInsertTable(3, 3); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2"
                >
                  <TableIcon className="w-3.5 h-3.5" /> درج جدول ۳×۳
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { executeCommand('insertHorizontalRule'); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2"
                >
                  <Minus className="w-3.5 h-3.5" /> خط جداکننده افقی
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveMenu(activeMenu === 'table' ? null : 'table')}
              className="px-2 py-1 rounded-md hover:bg-slate-200 text-slate-700"
            >
              جدول
            </button>
            {activeMenu === 'table' && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { handleInsertTable(2, 2); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  جدول ۲×۲
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { handleInsertTable(4, 3); setActiveMenu(null); }}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  جدول ۴×۳ (لیست قیمت)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleToggleSource}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isSourceMode
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="نمایش کد HTML خام"
          >
            {isSourceMode ? <Eye className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{isSourceMode ? 'نمای بصری WYSIWYG' : 'سورس HTML'}</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title={isFullscreen ? 'خروج از حالت تمام‌صفحه' : 'تمام‌صفحه'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TINYMCE ACTION TOOLBAR */}
      {!isSourceMode && (
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center flex-wrap gap-1 select-none">
          
          {/* Undo / Redo */}
          <div className="flex items-center border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('undo')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="بازگردانی (Undo)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('redo')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="تکرار (Redo)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Heading / Paragraph Selector */}
          <div className="relative border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowHeadingMenu(!showHeadingMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
            >
              <Type className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentBlock}</span>
            </button>

            {showHeadingMenu && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs font-bold">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('p', 'پاراگراف عادی')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-normal"
                >
                  پاراگراف عادی (Normal)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('h1', 'تیتر ۱ (H1)')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-900 font-black text-sm"
                >
                  تیتر بزرگ ۱ (H1)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('h2', 'تیتر ۲ (H2)')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-900 font-black text-xs"
                >
                  تیتر متوسط ۲ (H2)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('h3', 'تیتر ۳ (H3)')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                >
                  تیتر کوچک ۳ (H3)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('blockquote', 'باکس نقل‌قول')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-blue-700 font-medium"
                >
                  نقل‌قول (Quote)
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFormatBlock('pre', 'کد / فرمول')}
                  className="w-full text-right px-3 py-1.5 hover:bg-slate-100 text-slate-600 font-mono"
                >
                  بلوک کد / متن ثابت
                </button>
              </div>
            )}
          </div>

          {/* Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('bold')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-black"
              title="پررنگ (Bold)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('italic')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="کج (Italic)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('underline')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="خط زیرین (Underline)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="خط روی متن (Strikethrough)"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Alignments */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyRight')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="راست‌چین"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyCenter')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="وسط‌چین"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyLeft')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="چپ‌چین"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('justifyFull')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="تراز از دو طرف (Justify)"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="فهرست نشانه‌دار (Bullet List)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="فهرست شماره‌دار (Numbered List)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormatBlock('blockquote', 'نقل‌قول')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="باکس نکته / نقل‌قول"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Text Color Picker */}
          <div className="relative border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="رنگ متن (اعمال روی کلمه یا عبارت انتخاب‌شده)"
            >
              <Palette className="w-4 h-4 text-blue-600" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full right-0 mt-1 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 flex gap-1.5 flex-wrap w-44">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyTextColor(c)}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Insert Link & Table & Divider */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openLinkModal}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="افزودن لینک روی کلمه انتخاب شده"
            >
              <LinkIcon className="w-4 h-4 text-blue-600" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleInsertTable(3, 3)}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="افزودن جدول داده‌ها"
            >
              <TableIcon className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => executeCommand('insertHorizontalRule')}
              className="p-1.5 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              title="خط جداکننده"
            >
              <Minus className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Clear Format */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
            title="پاکسازی استایل و فونت انتخاب‌شده"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* EDITOR WORKSPACE (WYSIWYG or RAW HTML) */}
      <div className="flex-1 overflow-y-auto p-4 bg-white relative">
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="<p>کدهای HTML مقاله را اینجا وارد یا ویرایش کنید...</p>"
            className="w-full h-full min-h-[300px] p-3 font-mono text-xs text-slate-900 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none leading-relaxed dir-ltr resize-y"
            dir="ltr"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onSelect={saveSelection}
            style={{ minHeight }}
            dir="rtl"
            className="w-full h-full focus:outline-none text-xs sm:text-sm text-slate-900 leading-loose prose max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 blog-content"
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* FOOTER STATUS BAR (TINYMCE STYLE) */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 font-bold select-none flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-500">
            <span>کلمات:</span>
            <span className="text-blue-700 font-black">{formatNumberFa(wordCount)}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <span>کاراکترها:</span>
            <span className="text-slate-800">{formatNumberFa(charCount)}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <span>زمان تقریبی مطالعه:</span>
            <span className="text-emerald-700 font-black">{formatNumberFa(Math.max(1, Math.ceil(wordCount / 150)))} دقیقه</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <span>TinyMCE Visual Engine</span>
          <span>•</span>
          <span className="text-blue-600">Django Auto-Format Ready</span>
        </div>
      </div>

      {/* INSERT LINK MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                <span>درج پیوند اینترنتی (Link)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  آدرس اینترنتی پیوند (URL):
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  متن نمایشی پیوند (اختیاری):
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="مثلاً: مشاهده کاتالوگ قیمت"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 dir-rtl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>درج پیوند در متن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
