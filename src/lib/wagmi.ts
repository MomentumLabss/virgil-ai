import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, base, arbitrum, polygon, optimism, bsc } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Virgil",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
    "virgil-default-project",
  chains: [mainnet, sepolia, base, arbitrum, polygon, optimism, bsc],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});
