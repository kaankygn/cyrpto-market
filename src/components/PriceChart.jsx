import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

function PriceChart({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#333333' },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      timeScale: { timeVisible: true, borderColor: '#e0e0e0' },
      rightPriceScale: { borderColor: '#e0e0e0' },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#1D9E75',
      downColor: '#E24B4A',
      borderVisible: false,
      wickUpColor: '#1D9E75',
      wickDownColor: '#E24B4A',
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}

export default PriceChart;