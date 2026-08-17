import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

function PriceChart({ data, liveCandle }) {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      height: 500,
      layout: { background: { color: '#0d0d1a' }, textColor: '#6b6b9a' },
      grid: { vertLines: { color: 'rgba(0,229,255,0.06)' }, horzLines: { color: 'rgba(0,229,255,0.06)' } },
      timeScale: { timeVisible: true, borderColor: 'rgba(0,229,255,0.2)' },
      rightPriceScale: { borderColor: 'rgba(0,229,255,0.2)' },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00ffa3',
      downColor: '#ff3b6b',
      borderVisible: false,
      wickUpColor: '#00ffa3',
      wickDownColor: '#ff3b6b',
    });

    series.setData(data);
    chart.timeScale().fitContent();
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      seriesRef.current = null;
    };
  }, [data]);

  useEffect(() => {
    if (liveCandle && seriesRef.current) {
      seriesRef.current.update(liveCandle);
    }
  }, [liveCandle]);

  return <div ref={containerRef} className="w-full" />;
}

export default PriceChart;