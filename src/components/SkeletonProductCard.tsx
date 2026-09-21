import React from 'react';

export function SkeletonProductCard() {
  return (
    <div 
      className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 relative h-full animate-pulse shadow-xs"
    >
      {/* Top Badges & Brand Placeholder */}
      <div className="w-full">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {/* Compare checkbox placeholder */}
            <div className="w-16 h-6 bg-slate-100 rounded-xl" />
            {/* Badge placeholder */}
            <div className="w-12 h-5 bg-slate-100 rounded-lg" />
            {/* Origin badge placeholder */}
            <div className="w-10 h-5 bg-slate-100 rounded-lg" />
          </div>
          {/* Brand mono placeholder */}
          <div className="w-14 h-4 bg-slate-100 rounded-lg" />
        </div>

        {/* Product image & quick view trigger placeholder */}
        <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-100 flex items-center justify-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full" />
          
          {/* Detailed Stock Info Badge (Carton / Box / Pack) placeholder */}
          <div className="absolute bottom-2 right-2 left-2 h-7 bg-white/95 border border-slate-200/80 rounded-xl" />
        </div>

        {/* Title & Brand Placeholders */}
        <div className="mb-2.5 space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            {/* Title */}
            <div className="h-4.5 bg-slate-200 rounded-lg w-3/4" />
            {/* Brand mono code */}
            <div className="h-3.5 bg-slate-100 rounded-lg w-1/5" />
          </div>
          {/* English Subtitle */}
          <div className="h-3.5 bg-slate-100 rounded-lg w-1/2" />
        </div>

        {/* Product Description Placeholder */}
        <div className="mb-3 h-[72px] bg-slate-50/80 p-2 rounded-xl border border-slate-100 space-y-2">
          <div className="h-3 bg-slate-200 rounded-md w-full" />
          <div className="h-3 bg-slate-200 rounded-md w-11/12" />
          <div className="h-3 bg-slate-200 rounded-md w-4/5" />
        </div>

        {/* Dual Unit Stock Display Card Placeholder */}
        <div className="mb-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 sm:p-2.5">
          <div className="w-24 h-3 bg-slate-200 rounded mb-2" />
          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-7 bg-white rounded-xl border border-slate-200" />
            <div className="h-7 bg-white rounded-xl border border-slate-200" />
          </div>
        </div>

        {/* Dual or Single Price Cards Placeholder */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
          <div className="bg-blue-50/40 border border-blue-100/60 rounded-2xl p-2 h-11" />
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-2 h-11" />
        </div>

        {/* Wholesale Tier Discount Notification Placeholder */}
        <div className="h-7 bg-slate-50 border border-slate-200 rounded-xl mb-3" />
      </div>

      {/* Order Steppers / Out of stock Notice Placeholder */}
      <div className="pt-2.5 border-t border-slate-100 space-y-2">
        <div className="h-10 bg-slate-100 rounded-2xl" />
        <div className="h-10 bg-slate-100 rounded-2xl" />
        <div className="h-11 bg-blue-50 rounded-2xl" />
      </div>
    </div>
  );
}
