export function truncateAddress(address: string, start = 8, end = 8): string {
  if (!address || address.length < start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function truncateHash(hash: string, start = 8, end = 8): string {
  if (!hash || hash.length < start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = Math.floor((now - ts * 1000) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatNumber(n: number, decimals = 2): string {
  if (n === null || n === undefined) return "-";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
