import { useState, useEffect } from 'react'

export function useOrderBook(symbol) {
  const [book, setBook] = useState({ bids: [], asks: [] });

  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBook({ bids: data.bids, asks: data.asks });
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return book;
}