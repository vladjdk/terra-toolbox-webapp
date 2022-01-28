import { AccAddress, Coins, MsgExecuteContract, Fee, Coin } from "@terra-money/terra.js";
import { TxResult, useLCDClient, useWallet } from "@terra-money/wallet-provider";
import useFee from "./useFee";
import useAddress from "./useAddress";
  
export interface BidPool {
    sum_snapshot: string,
    product_snapshot: string,
    total_bid_amount: string,
    premium_rate: string,
    current_epoch: string,
    current_scale: string
}


export interface BidPoolsByCollateralResponse {
    bid_pools: BidPool[]
}

export interface Bid {
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

export interface GetBidsByUserResponse {
    bids: Bid[]
}
  
export const useAnchorLiquidationContract = (contractAddress: AccAddress) => {
    const { post } = useWallet();
    // TODO: Calculate fee via simulation if possible.
    const fee = useFee();
    const userWalletAddr = useAddress();
    const lcdClient = useLCDClient();

    function _query<T>(queryMsg: any) {
        return lcdClient.wasm.contractQuery<T>(contractAddress, queryMsg);
    }

    function _createExecuteMsg(executeMsg: any, coins?: Coins.Input) {
        return new MsgExecuteContract(
            userWalletAddr,
            contractAddress,
            executeMsg,
            coins
        );
    }

    function submitBid(inputAmount: number, collateralTokenContract: string, premiumSlot = 2): MsgExecuteContract {
        return _createExecuteMsg(
            {
                submit_bid: {
                    premium_slot: premiumSlot,
                    collateral_token: collateralTokenContract
                }
            },
            [new Coin('uusd', inputAmount)]
        )
    }

    function retractBid(bidIdx: string): MsgExecuteContract {
        return _createExecuteMsg(
            {
                retract_bid: {
                    bid_idx: bidIdx
                }
            }
        )
    }

    function activateBids(collateralTokenContract: string, bidIdx?: string[]): MsgExecuteContract {
        const msg = {
            activate_bids: {
                collateral_token: collateralTokenContract
            }
        } as any;

        if (bidIdx) {
            msg.activate_bids.bids_idx = bidIdx;
        }
        
        return _createExecuteMsg(msg);
    }

    function activateMultipleCollaterals(collaterals: string[]): MsgExecuteContract[] {
        const msgs: MsgExecuteContract[] = []
        collaterals.forEach(collateral => {
            const msg = {
                activate_bids: {
                    collateral_token: collateral
                }
            } as any;
            msgs.push(_createExecuteMsg(msg));
        });
        return msgs;
    }
    

    function claimLiquidations(collateralTokenContract: string, bidIdx?: string[]) {
        const msg = {
            claim_liquidations: {
                collateral_token: collateralTokenContract
            }
        } as any;

        if (bidIdx) {
            msg.claim_liquidations.bids_idx = bidIdx;
        }
        
        const executeMsg = _createExecuteMsg(msg)
      
        return post({
            msgs: [executeMsg],
            fee: new Fee(fee.gas, { uusd: fee.amount }),
        });
    }

    function getBidPoolsByCollateral(collateralTokenContract: string, limit = 31): Promise<BidPoolsByCollateralResponse> {
        return _query<BidPoolsByCollateralResponse>({
            bid_pools_by_collateral: {
                collateral_token: collateralTokenContract,
                limit: limit
            }
        });
    }

    // TODO: Queries for bids are limited to `limit`.
    //       Users with more than the `limit` may require an additional query.
    function getBidsByUser(collateralTokenContract: string, startAfter = '0', limit = 31): Promise<GetBidsByUserResponse> {
        return _query<GetBidsByUserResponse>({
            bids_by_user: {
                collateral_token: collateralTokenContract,
                bidder: userWalletAddr,
                start_after: startAfter,
                limit: limit 
            }
        })
    }

    function getFilledBidsPendingClaimAmount(collateralTokenContract: string): Promise<number> {
        return getBidsByUser(collateralTokenContract).then(bidsResponse => {
            let liquidationCollateral = 0;
            bidsResponse.bids.forEach(bid => {
                liquidationCollateral += parseInt(bid.pending_liquidated_collateral)
            });
            return liquidationCollateral;
        }).catch(() => {
            return 0;
        })
    }

    function getPendingBids(collateralTokenContract: string): Promise<Bid[]> {
        return getBidsByUser(collateralTokenContract).then(bidsResponse => {
            const currentTimestamp = Math.floor(new Date().getTime() / 1000)
            const pendingBids = [] as Bid[];
            bidsResponse.bids.forEach(bid => {
                if (bid.wait_end) {
                    const bidWaitEnd = parseInt(bid.wait_end);
                    if (currentTimestamp > bidWaitEnd) {
                        pendingBids.push(bid)
                    }
                }
            });
            return pendingBids;
        }).catch(() => {
            return [];
        })
    }

    return {
        submitBid,
        retractBid,
        activateBids,
        activateMultipleCollaterals,
        claimLiquidations,
        getBidPoolsByCollateral,
        getBidsByUser,
        getFilledBidsPendingClaimAmount,
        getPendingBids
    };
};
  