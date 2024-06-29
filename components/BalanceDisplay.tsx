// components/BalanceDisplay.tsx

import { FC, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';

export const BalanceDisplay: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!connection || !publicKey) {
                return;
            }

            try {
                const balance = await connection.getBalance(publicKey);
                setBalance(balance / web3.LAMPORTS_PER_SOL);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };

        fetchBalance();
    }, [connection, publicKey]);

    return (
        <div>
            <h3>Your Balance:</h3>
            {balance !== null ? <p>{balance} SOL</p> : <p>Loading...</p>}
        </div>
    );
};
