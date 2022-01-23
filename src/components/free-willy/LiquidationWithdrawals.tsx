import { MsgExecuteContract } from "@terra-money/terra.js";
import { useConnectedWallet, useLCDClient } from "@terra-money/wallet-provider";
import { useAnchorLiquidationContract } from "hooks/useAnchorLiquidationContract";
import { useCallback, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  UserDenied,
} from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { useRecoilValue } from "recoil";
import { networkNameState } from "data/network";
import 'components/free-willy/liquidation-withdrawals.css';
import "style.css"
import useNetwork from "hooks/useNetwork";

export default function LiquidationWithdrawals() {
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();

  interface Bid {
    idx: number;
    collateral_token: string;
    premium_slot: number;
    bidder: string;
    amount: number;
    product_snapshot: number;
    sum_snapshop: number;
    pending_liquidated_collateral: number;
    wait_end: number;
    epoch_snapshot: number;
    scale_snapshot: number;
  }
  interface BidsByUserResponse {
    bids: Array<Bid>;
  }

  interface Collaterals {
    bluna: number,
    beth: number
  }

  const network = useNetwork();
  const {getFilledBidsPendingClaimAmount} = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
  const [collaterals, setCollaterals] = useState<Collaterals | null>();

  const formatCollateralAmount = (bidAmount: number) => {
    return (bidAmount / 1000000);
}

  useEffect(() => {

    const bethCollateralAmountPromise = getFilledBidsPendingClaimAmount(network.contracts.beth);
    const blunaCollateralAmountPromise = getFilledBidsPendingClaimAmount(network.contracts.bluna);

    Promise.all([bethCollateralAmountPromise, blunaCollateralAmountPromise]).then(data => {
      const [bethCollateral, blunaCollateral] = data;
      setCollaterals(
        {
          bluna: formatCollateralAmount(blunaCollateral),
          beth: formatCollateralAmount(bethCollateral)
      })
    })
  }, [])

  return (
    <div id="liquidation-withdrawals">
        {collaterals?.bluna} bLuna
        {collaterals?.beth} bEth
    </div>
  );
}
