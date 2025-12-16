import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center py-2.5 bg-zinc-50 font-sans dark:bg-black">
      <main className="">
        <h1>Anchor Vault </h1>

        <ConnectWallet />
      </main>
    </div>
  );
}
