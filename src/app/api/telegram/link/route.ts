import { NextResponse } from "next/server";
import { linkCodes } from "@/lib/0g/storage";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    // Generate a 6-character hex code
    const code = randomBytes(3).toString("hex").toUpperCase();
    
    // Store it in memory mapped to the wallet address
    linkCodes.set(code, walletAddress);

    // Optional: Set an expiration timeout to delete the code after 10 minutes
    setTimeout(() => {
      if (linkCodes.get(code) === walletAddress) {
        linkCodes.delete(code);
      }
    }, 10 * 60 * 1000);

    return NextResponse.json({ code });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate link code" }, { status: 500 });
  }
}
