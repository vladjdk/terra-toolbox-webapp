import { Int, Fee, MsgExecuteContract } from '@terra-money/terra.js';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import React, { memo, useCallback, useEffect, useState } from 'react';
import BigNumber from "bignumber.js";
import { string } from 'yargs';
import {
    CreateTxFailed,
    Timeout,
    TxFailed,
    TxResult,
    TxUnspecifiedError,
    UserDenied,
  } from '@terra-money/wallet-provider';
import { GasInfo } from '@terra-money/terra.proto/cosmos/base/abci/v1beta1/abci';

export function QuerySample() {
    const lcd = useLCDClient();
    const connectedWallet = useConnectedWallet();
    
    var luna_bid_idx = Array<number>();
    var eth_bid_idx = Array<number>();

    const [luna_status, setLunaStatus] = useState<null | string>();
    const [total_luna_bids, setLunaTotalBids] = useState<null | string>();
    const [luna_bids, setLunaBids] = useState<null | Array<number>>();
    const [pending_luna_collection, setLunaPendingCollection] = useState<null | string>();
    const [luna_error, setLunaError] = useState<null | string>();
    const [luna_tx_error, setLunaTxError] = useState<null | string>();
    const [luna_tx_result, setLunaTxResult] = useState<null | TxResult>();


    const [eth_status, setEthStatus] = useState<null | string>();
    const [total_eth_bids, setEthTotalBids] = useState<null | string>();
    const [eth_bids, setEthBids] = useState<null | Array<number>>();
    const [pending_eth_collection, setEthPendingCollection] = useState<null | string>();
    const [eth_error, setEthError] = useState<null | string>();
    const [eth_tx_error, setEthTxError] = useState<null | string>();
    const [eth_tx_result, setEthTxResult] = useState<null | TxResult>();
    
    interface Bid {
        idx: number,
        collateral_token: string,
        premium_slot: number,
        bidder: string,
        amount: number,
        product_snapshot: number,
        sum_snapshop: number,
        pending_liquidated_collateral: number,
        wait_end: number,
        epoch_snapshot: number,
        scale_snapshot: number,
    }
    interface BidsByUserResponse {
        bids: Array<Bid>
    }

    const withdrawLuna = useCallback(() => {
        if (!connectedWallet) {
            return;
          }
      
          if (!connectedWallet.network.chainID.startsWith('columbus')) {
            alert(`Please only execute this example on Mainnet`);
            return;
          }
      
        //   setTxResult(null);
        //   setTxError(null);
      
          connectedWallet
            .post({
              msgs: [
                new MsgExecuteContract(connectedWallet.walletAddress, "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", {claim_liquidations: {
                    collateral_token: "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
                    bids_idx: luna_bid_idx
                }}),
              ],
              memo: "TerraToolbox.com"
            })
            .then((nextTxResult: TxResult) => {
              console.log(nextTxResult);
              setLunaTxResult(nextTxResult);
            })
            .catch((error: unknown) => {
              if (error instanceof UserDenied) {
                setLunaTxError('User Denied');
              } else if (error instanceof CreateTxFailed) {
                setLunaTxError('Create Tx Failed: ' + error.message);
              } else if (error instanceof TxFailed) {
                setLunaTxError('Tx Failed: ' + error.message);
              } else if (error instanceof Timeout) {
                setLunaTxError('Timeout');
              } else if (error instanceof TxUnspecifiedError) {
                setLunaTxError('Unspecified Error: ' + error.message);
              } else {
                setLunaTxError(
                  'Unknown Error: ' +
                    (error instanceof Error ? error.message : String(error)),
                );
              }
            });
    }, [connectedWallet]);

    const withdrawEth = useCallback(() => {
        if (!connectedWallet) {
            return;
          }
      
          if (!connectedWallet.network.chainID.startsWith('columbus')) {
            alert(`Please only execute this example on Mainnet`);
            return;
          }
      
        //   setTxResult(null);
        //   setTxError(null);
      
          connectedWallet
            .post({
              msgs: [
                new MsgExecuteContract(connectedWallet.walletAddress, "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u", {claim_liquidations: {
                    collateral_token: "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun",
                    bids_idx: luna_bid_idx
                }}),
              ],
              memo: "TerraToolbox.com"
            })
            .then((nextTxResult: TxResult) => {
              console.log(nextTxResult);
              setLunaTxResult(nextTxResult);
            })
            .catch((error: unknown) => {
              if (error instanceof UserDenied) {
                setLunaTxError('User Denied');
              } else if (error instanceof CreateTxFailed) {
                setLunaTxError('Create Tx Failed: ' + error.message);
              } else if (error instanceof TxFailed) {
                setLunaTxError('Tx Failed: ' + error.message);
              } else if (error instanceof Timeout) {
                setLunaTxError('Timeout');
              } else if (error instanceof TxUnspecifiedError) {
                setLunaTxError('Unspecified Error: ' + error.message);
              } else {
                setLunaTxError(
                  'Unknown Error: ' +
                    (error instanceof Error ? error.message : String(error)),
                );
              }
            });
    }, [connectedWallet]);
    
    useEffect(() => {
        if (connectedWallet) {
            //bLUNA
            lcd.wasm.contractQuery<BidsByUserResponse>(
                "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u",
                {
                    bids_by_user: {
                        collateral_token: "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp",
                        bidder: connectedWallet.walletAddress
                    }
                }, ).then((res) => {
                    if(res.bids.length > 0) {
                        setLunaStatus("Available")
                        
                        var total_bids = new BigNumber(0);
                        var pending_collection = new BigNumber(0);
                        for(var i = 0; i < res.bids.length; i++) {
                            luna_bid_idx.push(res.bids[i].idx);
                            total_bids = total_bids.plus(new BigNumber(res.bids[i].amount));
                            pending_collection = pending_collection.plus(new BigNumber(res.bids[i].pending_liquidated_collateral));
                        }
                        setLunaBids(luna_bid_idx)
                        console.log(total_bids)
                        setLunaTotalBids((total_bids.dividedBy(1_000_000)).toString());
                        setLunaPendingCollection((pending_collection.dividedBy(1_000_000)).toString());
                    } else {
                        setLunaStatus("Unavailable")
                    }
                }).catch((err) => {
                    setLunaError(err.toString())
                })
                
                //bETH
                lcd.wasm.contractQuery<BidsByUserResponse>(
                    "terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u",
                    {
                        bids_by_user: {
                            collateral_token: "terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun",
                            bidder: connectedWallet.walletAddress
                        }
                    }).then((res) => {
                        if(res.bids.length > 0) {
                            setEthStatus("Available")
                            var total_bids = new BigNumber(0);
                            var pending_collection = new BigNumber(0);
                            for(var i = 0; i < res.bids.length; i++) {
                                total_bids = total_bids.plus(new BigNumber(res.bids[i].amount));
                                pending_collection = pending_collection.plus(new BigNumber(res.bids[i].pending_liquidated_collateral));
                            }
                            setEthBids(eth_bid_idx)
                            console.log(total_bids)
                            setEthTotalBids((total_bids.dividedBy(1_000_000)).toString());
                            setEthPendingCollection((pending_collection.dividedBy(1_000_000)).toString());
                        } else {
                            setEthStatus("Unavailable")
                        }
                    }).catch((err) => {
                        setEthError(err.toString())
                    })
                // lcd.bank.balance(connectedWallet.walletAddress).then(([coins]) => {
                //   setBank(coins.toString());
                // });
            } else {
                setEthTotalBids(null);
            }
        }, [connectedWallet, lcd]);
        
        return (
            <div>
            <h1>Liquidation Withdrawals</h1>
            <h2>bLUNA: {luna_status}</h2>
            {/* {luna_bidder && <pre>Bidder: {luna_bidder}</pre>} */}
            {total_luna_bids && <pre>Total bid amount: {total_luna_bids} UST</pre>}
            {pending_luna_collection && <pre>Pending collection amount: {pending_luna_collection} bLUNA</pre>}
            {luna_error && <pre>Error: {luna_error}</pre>}
            {luna_bids && <pre>bLUNA Bids: {luna_bids.map(item => {
                return <p>{item}</p>
            })}</pre>}
            {!luna_tx_result && !luna_tx_error && pending_luna_collection && total_luna_bids?.length != 0 && luna_status && parseFloat(pending_luna_collection!.toString()) !=0 ? <button onClick={withdrawLuna}>Withdraw {pending_luna_collection} bLUNA</button> : <button disabled onClick={withdrawLuna}>Withdraw 0 bLUNA</button>}
            {luna_tx_result && (
            <>
            <pre>{JSON.stringify(luna_tx_result, null, 2)}</pre>

                {connectedWallet && luna_tx_result && (
                    <div>
                    <a
                        href={`https://finder.terra.money/${connectedWallet.network.chainID}/tx/${luna_tx_result.result.txhash}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open Tx Result in Terra Finder
                    </a>
                    </div>
                )}
                </>
            )}
            <h2>bETH: {eth_status}</h2>
            {/* {eth_bidder && <pre>Bidder: {eth_bidder}</pre>} */}
            {total_eth_bids && <pre>Total bid amount: {total_eth_bids} UST</pre>}
            {pending_eth_collection && <pre>Pending collection amount: {pending_eth_collection} bLUNA</pre>}
            {eth_error && <pre>Error: {eth_error}</pre>}
            {eth_bids && <pre>bETH Bids: {eth_bids.map(item => {
                return <p>{item}</p>
            })}</pre>}
            {!eth_tx_result && !eth_tx_error && pending_eth_collection && total_eth_bids?.length != 0 && eth_status && parseFloat(pending_eth_collection!.toString()) !=0 ? <button onClick={withdrawEth}>Withdraw {pending_eth_collection} bLUNA</button> : <button disabled onClick={withdrawLuna}>Withdraw 0 bETH</button>}
            {!connectedWallet && <p>Wallet not connected!</p>}
            </div>
            );
        }
        