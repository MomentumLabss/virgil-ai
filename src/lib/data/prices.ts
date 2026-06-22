export async function getTokenPrice(
  tokenId: string,
  currency = "USDT"
): Promise<number | null> {
  try {
    const symbol = `${tokenId.toUpperCase()}${currency.toUpperCase()}`;
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await fetch(url);
    
    if (!res.ok) return null;
    
    const data = await res.json() as { price: string };
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

export async function getETHPrice(): Promise<number | null> {
  return getTokenPrice("ETH", "USDT");
}

// Map common token symbols to Binance base symbols
const TOKEN_ID_MAP: Record<string, string> = {
  eth: "ETH",
  ethereum: "ETH",
  btc: "BTC",
  bitcoin: "BTC",
  usdc: "USDC", 
  link: "LINK",
  uni: "UNI",
  aave: "AAVE",
  matic: "MATIC",
  pol: "POL",
};

export function getTokenId(symbol: string): string | null {
  return TOKEN_ID_MAP[symbol.toLowerCase()] || symbol.toUpperCase();
}
