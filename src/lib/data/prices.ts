const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export async function getTokenPrice(
  tokenId: string,
  currency = "usd"
): Promise<number | null> {
  try {
    const url = `${COINGECKO_API_URL}/simple/price?ids=${tokenId}&vs_currencies=${currency}`;
    const res = await fetch(url);
    const data = (await res.json()) as Record<
      string,
      Record<string, number>
    >;

    return data[tokenId]?.[currency] ?? null;
  } catch {
    return null;
  }
}

export async function getETHPrice(): Promise<number | null> {
  return getTokenPrice("ethereum", "usd");
}

// Map common token symbols to CoinGecko IDs
const TOKEN_ID_MAP: Record<string, string> = {
  eth: "ethereum",
  ethereum: "ethereum",
  btc: "bitcoin",
  bitcoin: "bitcoin",
  usdc: "usd-coin",
  usdt: "tether",
  dai: "dai",
  link: "chainlink",
  uni: "uniswap",
  aave: "aave",
  matic: "matic-network",
  pol: "polygon-ecosystem-token",
};

export function getTokenId(symbol: string): string | null {
  return TOKEN_ID_MAP[symbol.toLowerCase()] || null;
}
