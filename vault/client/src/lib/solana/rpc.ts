import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

export const RPC_ENDPOINT = 'https://api.devnet.solana.com';
export const WS_ENDPOINT = 'wss://api.devnet.solana.com';

export const rpc = createSolanaRpc(RPC_ENDPOINT);
export const rpcSubscriptions = createSolanaRpcSubscriptions(WS_ENDPOINT);
