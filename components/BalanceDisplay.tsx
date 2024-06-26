// BalanceDisplay.tsx

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react'

export const BalanceDisplay: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (!connection || !publicKey) { return }

        // Subscribe to account changes (optional, depending on your app flow)
        const onAccountChange = (updatedAccountInfo) => {
            // Handle account change if needed
        };

        connection.onAccountChange(publicKey, onAccountChange, 'confirmed');

        // Cleanup function to unsubscribe (if necessary)
        return () => connection.removeAccountChangeListener(publicKey);
    }, [connection, publicKey])

    return null; // No display of balance
}
