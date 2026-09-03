import React from 'react';
import { Range, getTrackBackground } from 'react-range';
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
  const values = [currentMin, currentMax];

  return (
    <div className="space-y-5 bg-slate-50/90 p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px]">از:</span>
          <span className="text-blue-600 font-black">{formatNumberFa(currentMin)}</span>
          <span className="text-[10px] text-slate-500">تومان</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-[10px]">تا:</span>
          <span className="text-blue-600 font-black">{formatNumberFa(currentMax)}</span>
          <span className="text-[10px] text-slate-500">تومان</span>
        </div>
      </div>

      <div className="pt-6 pb-2 px-2">
        <Range
          step={1000000}
          min={min}
          max={max}
          values={values}
          onChange={(vals) => onChange(vals[0], vals[1])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '8px',
                width: '100%',
                borderRadius: '9999px',
                background: getTrackBackground({
                  values,
                  colors: ['#e2e8f0', '#2563eb', '#e2e8f0'],
                  min: min,
                  max: max,
                  rtl: true,
                }),
              }}
              className="cursor-pointer"
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index, isDragged }) => {
            const { key, ...restProps } = props;
            const value = values[index];
            return (
              <div
                key={key}
                {...restProps}
                style={{
                  ...restProps.style,
                  outline: 'none',
                }}
                className={`w-6 h-6 rounded-full bg-white border-4 border-blue-600 shadow-lg flex items-center justify-center transition-transform cursor-grab active:cursor-grabbing ${
                  isDragged ? 'scale-125 ring-4 ring-blue-100' : 'hover:scale-110'
                }`}
              >
                {/* Floating Value Tooltip on Thumb */}
                <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none transition-all">
                  {formatNumberFa(value)} ت
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-[11px]">
        <button
          type="button"
          onClick={() => onChange(0, 200000000)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          همه قیمت‌ها
        </button>
        <button
          type="button"
          onClick={() => onChange(0, 30000000)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          تا ۳۰ میلیون
        </button>
        <button
          type="button"
          onClick={() => onChange(30000000, 70000000)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          ۳۰ تا ۷۰ میلیون
        </button>
        <button
          type="button"
          onClick={() => onChange(70000000, 200000000)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
        >
          بالای ۷۰ میلیون
        </button>
      </div>
    </div>
  );
};
