import { Coin, MsgExecuteContract } from "@terra-money/terra.js";
import { useConnectedWallet, useLCDClient } from "@terra-money/wallet-provider";
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
import "style.css"

export function KujiWithdrawals() {
  const lcd = useLCDClient();
  const connectedWallet = useConnectedWallet();

  // Kuji-UST LP const
  const [kuji_ust_lp_amount_max, setKujiUstLpAmountMax] = useState<null | number>();
  const [kuji_ust_lp_amount, setKujiUstLpAmount] = useState<null | number>();
  const [lp_error, setLpError] = useState<null | string>();
  const [lp_tx_error, setLpTxError] = useState<null | string>();
  const [lp_tx_result, setLpTxResult] = useState<null | TxResult>();

  // Kuji staked const
  const [kuji_stake_amount_max, setKujiStakeAmountMax] = useState<null | number>();
  const [kuji_stake_amount_unbond, setKujiStakeAmountUnbond] = useState<null | number>();
  const [kuji_stake_claims, setKujiClaims] = useState<null | Boolean>();
  const [stake_error, setStakeError] = useState<null | string>();
  const [stake_tx_error, setStakeTxError] = useState<null | string>();
  const [stake_tx_result, setStakeTxResult] = useState<null | TxResult>();
  const [claim_error, setClaimError] = useState<null | string>();
  const [claim_tx_error, setClaimTxError] = useState<null | string>();
  const [claim_tx_result, setClaimTxResult] = useState<null | TxResult>();


  interface LPStakerInfo {
    staker: string;
    reward_index: string;
    bond_amount: number;
    pending_reward: number;
  }

  interface Coin {
    cw20: string
  }

  interface GovStakerInfo {
    stake: number,
    denom: Coin,
  }

  interface TimeStamp {
    at_time: number,
  }

  interface Claim {
    amount: number
    release_at: TimeStamp
  }

  interface GovStakerClaim {
    claims: Array<Claim>;
  }

  // withdraw lp transaction
  const withdrawLPKujiUst = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    if (!connectedWallet.network.chainID.startsWith("columbus")) {
      alert(`Please only execute this example on Mainnet`);
      return;
    }

    connectedWallet
      .post({
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            "terra1cf9q9lq7tdfju95sdw78y9e34a6qrq3rrc6dre", // https://finder.extraterrestrial.money/mainnet/address/terra1cf9q9lq7tdfju95sdw78y9e34a6qrq3rrc6dre
            {
              unbond: {
                amount: kuji_ust_lp_amount,
              },
            }
          ),
        ],
        memo: "Bye Bye! Free Willy"
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setLpTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setLpTxError("User Denied");
        } else if (error instanceof CreateTxFailed) {
          setLpTxError("Create Tx Failed: " + error.message);
        } else if (error instanceof TxFailed) {
          setLpTxError("Tx Failed: " + error.message);
        } else if (error instanceof Timeout) {
          setLpTxError("Timeout");
        } else if (error instanceof TxUnspecifiedError) {
          setLpTxError("Unspecified Error: " + error.message);
        } else {
          setLpTxError(
            "Unknown Error: " +
            (error instanceof Error ? error.message : String(error))
          );
        }
      });
  }, [connectedWallet, kuji_ust_lp_amount]);

  // unbond Kuji if still staked
  const unBondKujiStake = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    if (!connectedWallet.network.chainID.startsWith("columbus")) {
      alert(`Please only execute this example on Mainnet`);
      return;
    }

    connectedWallet
      .post({
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            "terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz", // https://finder.extraterrestrial.money/mainnet/address/terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz
            {
              unbond: {
                tokens: kuji_stake_amount_unbond,
              },
            }
          ),
        ],
        memo: "Bye Bye! Free Willy"
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setStakeTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setStakeTxError("User Denied");
        } else if (error instanceof CreateTxFailed) {
          setStakeTxError("Create Tx Failed: " + error.message);
        } else if (error instanceof TxFailed) {
          setStakeTxError("Tx Failed: " + error.message);
        } else if (error instanceof Timeout) {
          setStakeTxError("Timeout");
        } else if (error instanceof TxUnspecifiedError) {
          setStakeTxError("Unspecified Error: " + error.message);
        } else {
          setStakeTxError(
            "Unknown Error: " +
            (error instanceof Error ? error.message : String(error))
          );
        }
      });
  }, [connectedWallet, kuji_stake_amount_unbond]);

  // claim unbonded kuji
  const claimKujiStake = useCallback(() => {
    if (!connectedWallet) {
      return;
    }

    if (!connectedWallet.network.chainID.startsWith("columbus")) {
      alert(`Please only execute this example on Mainnet`);
      return;
    }

    connectedWallet
      .post({
        msgs: [
          new MsgExecuteContract(
            connectedWallet.walletAddress,
            "terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz", // https://finder.extraterrestrial.money/mainnet/address/terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz
            {
              claim: {},
            }
          ),
        ],
        memo: "Bye Bye! Free Willy"
      })
      .then((nextTxResult: TxResult) => {
        console.log(nextTxResult);
        setClaimTxResult(nextTxResult);
      })
      .catch((error: unknown) => {
        if (error instanceof UserDenied) {
          setClaimTxError("User Denied");
        } else if (error instanceof CreateTxFailed) {
          setClaimTxError("Create Tx Failed: " + error.message);
        } else if (error instanceof TxFailed) {
          setClaimTxError("Tx Failed: " + error.message);
        } else if (error instanceof Timeout) {
          setClaimTxError("Timeout");
        } else if (error instanceof TxUnspecifiedError) {
          setClaimTxError("Unspecified Error: " + error.message);
        } else {
          setClaimTxError(
            "Unknown Error: " +
            (error instanceof Error ? error.message : String(error))
          );
        }
      });
  }, [connectedWallet]);

  useEffect(() => {
    if (connectedWallet) {

      // check if lp is stacked
      lcd.wasm
        .contractQuery<LPStakerInfo>(
          "terra1cf9q9lq7tdfju95sdw78y9e34a6qrq3rrc6dre",
          {
            staker_info: {
              staker: connectedWallet.walletAddress,
            },
          }
        )
        .then((res) => {
          if (res.bond_amount > 0) {
            setKujiUstLpAmountMax(res.bond_amount);
            setKujiUstLpAmount(res.bond_amount);
            console.log(res.bond_amount);
          } else {
            setKujiUstLpAmountMax(0);
            setKujiUstLpAmount(0);
          }
        })
        .catch((err) => {
          setLpError(err.toString());
        });

      // check wallet has staked kujira
      lcd.wasm
        .contractQuery<GovStakerInfo>(
          "terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz",
          {
            staked: {
              address: connectedWallet.walletAddress,
            },
          }
        )
        .then((res) => {
          if (res.stake > 0) {
            setKujiStakeAmountMax(res.stake);
            setKujiStakeAmountUnbond(res.stake);
            console.log(res.stake);
          } else {
            setKujiStakeAmountMax(0);
            setKujiStakeAmountUnbond(0);
          }
        })
        .catch((err) => {
          setStakeError(err.toString());
        });

      // check if unbond period is over and we can claim kujira
      // need to understand how the claims array looks like...mine is empty.
      lcd.wasm
        .contractQuery<GovStakerClaim>(
          "terra1w7gtx76rs7x0e27l7x2e88vcr52tp9d8g4umjz",
          {
            claims: {
              address: connectedWallet.walletAddress,
            },
          }
        )
        .then((res) => {
          if (res.claims.length > 0) {
            setKujiClaims(true);
            console.log(res.claims);
          } else {
            setKujiClaims(false);
          }
        })
        .catch((err) => {
          setClaimError(err.toString());
        });
    } else {
      setKujiStakeAmountMax(null);
      setKujiStakeAmountUnbond(null);
      setKujiUstLpAmountMax(null);
      setKujiUstLpAmount(null);
      setKujiClaims(false);
    }
  }, [connectedWallet, lcd]);

  console.log("address", useAddress());
  let networkName = useRecoilValue(networkNameState);
  console.log("network: ", networkName);

  return (
    <div className="kujiwithdraw">
      <h1>Unlock Kuji from Kujira Contracts</h1>
      <p>
        When you use this toolbox Kujira will lock all their applications 
        ORCA and Blue etc for you.
        Even when you are an active Kujira staker or Liquidity Provider.
        Its like when your bank does not let you access your account again because
        you tried out another Bank to see if this one is better.
      </p>
      <p>
        Blockchains are permission less and open for a reason! There should never
        be a gate keeper that does not give you access to money that is yours.
        Here you can unbond and withdraw your staked Kuji and your LP position.
      </p>
      <h2>Unlock $Kuji/$UST LP Position</h2>
      <p>
        {kuji_ust_lp_amount_max ? (
          <pre>Availible LP Max: {kuji_ust_lp_amount_max} LP Token</pre>
        ) : (
          <pre>No LP availible</pre>
        )
        }
      </p>
      <p>
        <div>
          {kuji_ust_lp_amount && kuji_ust_lp_amount_max ? (
            <label>
              LP 
              <input type="number" value={kuji_ust_lp_amount} name="kuji_ust_lp_amount" />
              <button onClick={withdrawLPKujiUst}>
                Withdraw $Kuji/UST LP
              </button>
            </label>)
            : (
              <label>
                LP Withdrawn      <input type="number" value="0" name="kuji_ust_lp_amount" disabled />
                <button onClick={withdrawLPKujiUst} disabled>
                  Withdraw $Kuji/UST LP
                </button>     </label>)
          }
        </div>
      </p>
      <h2>Unbound Staked $Kuji</h2>
      <p>Unbound period is 14 days ! You can comeback and claim your Kuji after that.</p>
      <p>
        {kuji_stake_amount_unbond ? (
          <pre>Availible $Kuji  {kuji_stake_amount_max} </pre>
        ) : (
          <pre>No $Kuji staked</pre> 
        )}
      </p>
      <p>
        <div>
          {kuji_stake_amount_unbond && kuji_stake_amount_max ? (
            <label>
              LP 
              <input type="number" value={kuji_stake_amount_unbond} name="kuji_stake_amount_unbond" />
              <button onClick={withdrawLPKujiUst}>
                Withdraw $Kuji/UST LP
              </button>
            </label>)
            : (
              <label>
                LP Withdrawn      <input type="number" value="0" name="kuji_stake_amount_unbond" disabled />
                <button onClick={unBondKujiStake} disabled>
                  Withdraw $Kuji/UST LP
                </button>     </label>)
          }
        </div>
      </p>
      {stake_tx_result && (
        <>
          {connectedWallet && stake_tx_result && (
            <div>
              <a
                href={`https://finder.terra.money/${connectedWallet.network.chainID}/tx/${stake_tx_result.result.txhash}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Tx Result in Terra Finder
              </a>
            </div>
          )}
        </>
      )}
      <h2>Claim your $Kuji</h2>
      <p>
        {kuji_stake_claims ? (
          <pre>You can claim all your $Kuji</pre>
        ) : (
          <pre>No $Kuji to claim availible</pre>
        )}
      </p>
      <p>
        <label>
          <button onClick={claimKujiStake} disabled={!kuji_stake_claims}>
            Claim $Kuji
          </button>
        </label>
      </p>
      {claim_tx_result && (
        <>
          {connectedWallet && claim_tx_result && (
            <div>
              <a
                href={`https://finder.terra.money/${connectedWallet.network.chainID}/tx/${claim_tx_result.result.txhash}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Tx Result in Terra Finder
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
