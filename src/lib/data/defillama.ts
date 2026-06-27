

export async function getProtocolTVL(protocolSlug: string): Promise<any> {
  try {
    const res = await fetch(`https://api.llama.fi/protocol/${protocolSlug.toLowerCase()}`);
    if (!res.ok) throw new Error("Protocol not found");
    const data = await res.json();
    return {
      name: data.name,
      tvl: data.tvl,
      chains: data.chains,
      category: data.category
    };
  } catch (error) {
    return { error: `Failed to fetch TVL for ${protocolSlug}` };
  }
}
