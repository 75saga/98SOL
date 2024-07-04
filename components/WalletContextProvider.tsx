// walletcontextprovider.tsx
import { FC, ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
require('@solana/wallet-adapter-react-ui/styles.css');

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const wallets = [new PhantomWalletAdapter()];

    const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC_ENDPOINT;

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletContextProvider;
