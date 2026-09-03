import React from 'react';
import { formatNumberFa } from '../utils/formatters';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
}) => {
  const step = 1000000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onChange(0, value);
  };

  const percent = Math.max(0, Math.min(100, ((currentMax - min) / (max - min)) * 100));

  return (
    <div className="space-y-4 bg-slate-50/90 p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <div className="text-slate-500 font-bold">حداکثر قیمت کارتن:</div>
        <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-blue-600 font-black">{formatNumberFa(currentMax)}</span>
          <span className="text-[10px] text-slate-500">تومان</span>
        </div>
      </div>

      <div className="pt-6 pb-2 px-4 relative select-none">
        {/* Track Background */}
        <div className="relative h-2 bg-slate-200 rounded-full w-full overflow-hidden">
          {/* Active Range Highlight (RTL: starts from right, fills towards left) */}
          <div
            className="absolute top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-75"
            style={{
              right: '0%',
              width: `${percent}%`,
            }}
          />
        </div>

        {/* Range Input (Single Thumb with RTL direction) */}
        <div className="absolute inset-x-4 top-6 h-8 pointer-events-none">
          <input
            type="range"
            dir="rtl"
            min={min}
            max={max}
            step={step}
            value={currentMax}
            onChange={handleChange}
            className="absolute w-full h-2 bg-transparent appearance-none pointer-events-auto cursor-pointer z-30 accent-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-[11px]">
        <button
          type="button"
          onClick={() => onChange(0, 200000000)}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs font-bold ${
            currentMax >= 200000000
              ? 'bg-blue-600 text-white font-black'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          همه قیمت‌ها
        </button>
        <button
          type="button"
          onClick={() => onChange(0, 30000000)}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs font-bold ${
            currentMax === 30000000
              ? 'bg-blue-600 text-white font-black'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          تا ۳۰ میلیون
        </button>
        <button
          type="button"
          onClick={() => onChange(0, 50000000)}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs font-bold ${
            currentMax === 50000000
              ? 'bg-blue-600 text-white font-black'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          تا ۵۰ میلیون
        </button>
        <button
          type="button"
          onClick={() => onChange(0, 100000000)}
          className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs font-bold ${
            currentMax === 100000000
              ? 'bg-blue-600 text-white font-black'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          تا ۱۰۰ میلیون
        </button>
      </div>
    </div>
  );
};
