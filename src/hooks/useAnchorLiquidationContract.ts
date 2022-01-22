import { AccAddress, Coins, MsgExecuteContract, Fee, Coin } from "@terra-money/terra.js";
import { useRecoilValue } from "recoil";
import { lcdClientQuery } from "../data/network";
import { addressState } from "../data/wallet";
import { TxResult, useWallet } from "@terra-money/wallet-provider";
import useFee from "./useFee";
  
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
    const userWalletAddr = useRecoilValue(addressState);
    const lcdClient = useRecoilValue(lcdClientQuery);

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

    function submitBid(inputAmount: number, collateralTokenContract: string, premiumSlot = 2): Promise<TxResult> {
        const executeMsg = _createExecuteMsg(
            {
                submit_bid: {
                    premium_slot: premiumSlot,
                    collateral_token: collateralTokenContract
                }
            },
            [new Coin('uusd', inputAmount)]
        )
      
        return post({
            msgs: [executeMsg],
            fee: new Fee(fee.gas, { uusd: fee.amount }),
        });
    }

    function retractBid(bidIdx: string) {
        const executeMsg = _createExecuteMsg(
            {
                retract_bid: {
                    bids_idx: bidIdx
                }
            }
        )
      
        return post({
            msgs: [executeMsg],
            fee: new Fee(fee.gas, { uusd: fee.amount }),
        });
    }

    function activateBids(collateralTokenContract: string, bidIdx: string) {
        const executeMsg = _createExecuteMsg(
            {
                activate_bids: {
                    bids_idx: bidIdx,
                    collateral_token: collateralTokenContract
                }
            }
        )
      
        return post({
            msgs: [executeMsg],
            fee: new Fee(fee.gas, { uusd: fee.amount }),
        });
    }

    function claimLiquidations(collateralTokenContract: string) {
        const executeMsg = _createExecuteMsg(
            {
                claim_liquidations: {
                    collateral_token: collateralTokenContract
                }
            }
        )
      
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
        claimLiquidations,
        getBidPoolsByCollateral,
        getBidsByUser,
        getFilledBidsPendingClaimAmount,
        getPendingBids
    };
};
  