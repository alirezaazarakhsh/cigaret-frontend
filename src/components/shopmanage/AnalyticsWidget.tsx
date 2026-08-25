import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

interface AnalyticsWidgetProps {
  brandSales: { brand: string; sales: number }[];
  weeklySales: { day: string; sales: number }[];
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ brandSales, weeklySales }) => {
  const pieRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pieRef.current || !barRef.current) return;

    // Clear previous charts
    d3.select(pieRef.current).selectAll('*').remove();
    d3.select(barRef.current).selectAll('*').remove();

    // Pie Chart
    const width = 300, height = 300, radius = Math.min(width, height) / 2;
    const pieSvg = d3.select(pieRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie<{ brand: string; sales: number }>().value(d => d.sales);
    const arc = d3.arc<d3.PieArcDatum<{ brand: string; sales: number }>>().innerRadius(0).outerRadius(radius - 10);

    const arcs = pieSvg.selectAll('arc').data(pie(brandSales)).enter().append('g');
    arcs.append('path').attr('d', arc).attr('fill', (d, i) => color(i.toString()));

    // Bar Chart
    const barWidth = 400, barHeight = 300;
    const barSvg = d3.select(barRef.current)
      .append('svg')
      .attr('width', barWidth)
      .attr('height', barHeight);

    const x = d3.scaleBand().range([0, barWidth]).padding(0.1).domain(weeklySales.map(d => d.day));
    const y = d3.scaleLinear().range([barHeight, 0]).domain([0, d3.max(weeklySales, d => d.sales) || 0]);

    barSvg.selectAll('.bar')
      .data(weeklySales)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.day)!)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.sales))
      .attr('height', d => barHeight - y(d.sales))
      .attr('fill', 'steelblue');

  }, [brandSales, weeklySales]);

  const downloadChart = (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (ref.current) {
      toPng(ref.current).then(dataUrl => {
        const link = document.createElement('a');
        link.download = `${name}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  };

  return (
    <div ref={widgetRef} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-black text-slate-800 mb-6">گزارش تحلیلی فروش</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div ref={pieRef} />
          <button onClick={() => downloadChart(pieRef, 'brand-sales')} className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600">
            <Download className="w-4 h-4" /> دانلود نمودار برندها
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div ref={barRef} />
          <button onClick={() => downloadChart(barRef, 'weekly-sales')} className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600">
            <Download className="w-4 h-4" /> دانلود نمودار هفتگی
          </button>
        </div>
      </div>
    </div>
  );
};
