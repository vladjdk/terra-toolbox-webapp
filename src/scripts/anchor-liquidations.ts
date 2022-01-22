// WORK IN PROGRESS
// Typescript conversion of Papi's original library.

import { Coin, LCDClient, MsgExecuteContract } from "@terra-money/terra.js";
import { ConnectedWallet } from "@terra-money/wallet-provider";

// TODO: Move this constants to a settings file.
export const BLUNA_TOKEN_CONTRACT = 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp';
export const BETH_TOKEN_CONTRACT = 'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun';
export const ANCHOR_LIQUIDATION_CONTRACT = 'terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u';
export const NativeTokens = {
    uusd: 'uusd'
}

// TODO: Decide if these functions should just return the formatted messages, or perform the signing and waiting.
//       Allowing the page to deal with the post and wait logistics allows us "String" over "ConnectedWallet" in the params.

/**
* Places a bid on a loan liquidation.
* @param wallet: user's connected wallet
* @param inputAmount: bid amount in uust
* @param collateralTokenContract: asset to bid on
* @param premiumSlot: bid premium
*/
export async function placeBid(
    wallet: ConnectedWallet,
    inputAmount: number,
    collateralTokenContract: string,
    premiumSlot = 2
): Promise<boolean> {
    const msg = new MsgExecuteContract(
        wallet.walletAddress,
        ANCHOR_LIQUIDATION_CONTRACT,
        {
            submit_bid: {
                premium_slot: premiumSlot,
                collateral_token: collateralTokenContract
            }
        },
        [new Coin(NativeTokens.uusd, inputAmount)]
    )
    try{
        var tx = await wallet.post({
            msgs: [msg]
        });
        // TODO: Wait for the transaction to resolve or just return the txhash.
        //       tx is NOT a resolved transaction and is pending.
        return true;
    } catch (error) {
        return false
    }
}


interface Bid {
    idx: string,
    collateral_token: string,
    premium_slot: number,
    bidder: string,
    amount: string,
    product_snapshot: string,
    sum_snapshot: string,
    pending_liquidated_collateral: string,
    wait_end: string | null, // TODO: Verify that type is string | null
    epoch_snapshot: string,
    scale_snapshot: string
}

interface GetBidsByUserResponse {
    bids: Bid[]
}


/**
* Returns array of bids placed by a given wallet.
* @param wallet: user's connected wallet
* @param lcdClient: Terra LCD Client
* @param collateralTokenContract: asset to bid on
* @param pendingBids: return pending bids
*/
export async function getBidsByUser(
    wallet: ConnectedWallet,
    lcdClient: LCDClient,
    collateralTokenContract: string,
    pendingBids = false
): Promise<Bid[]> {
    const msg = {
        bids_by_user: {
            collateral_token: collateralTokenContract,
            bidder: wallet.walletAddress,
            start_after: "0", // TODO: Should we parameterize start_after and limit?
            limit: 31 
        }
    }
    try {
        const response = await lcdClient.wasm.contractQuery(ANCHOR_LIQUIDATION_CONTRACT, msg) as GetBidsByUserResponse;
        const bids = [] as Bid[];
        const currentTimestamp = Math.floor(new Date().getTime() / 1000);

        response.bids.forEach(bid => {
            const bidWaitEnd = (bid.wait_end !== null) ? parseInt(bid.wait_end) : null;
            if (pendingBids && bidWaitEnd !== null && currentTimestamp > bidWaitEnd) {
                bids.push(bid);
            } else if (!pendingBids && bidWaitEnd === null) {
                bids.push(bid);
            }
        });
        
        return bids;
    } catch {
        return [];
    }
}

interface BidPool {
    sum_snapshot: string,
    product_snapshot: string,
    total_bid_amount: string,
    premium_rate: string,
    current_epoch: string,
    current_scale: string
}


interface BidPoolsByCollateralResponse {
    bid_pools: BidPool[]
}

export async function getBidPoolsByCollateral(lcdClient: LCDClient, collateralTokenContract: string): Promise<BidPoolsByCollateralResponse> {
    return await lcdClient.wasm.contractQuery(ANCHOR_LIQUIDATION_CONTRACT, {
        bid_pools_by_collateral: {
            collateral_token: collateralTokenContract,
            limit: 31
        }
    }) as BidPoolsByCollateralResponse;
}
