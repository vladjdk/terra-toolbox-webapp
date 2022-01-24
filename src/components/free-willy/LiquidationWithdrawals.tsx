import { useConnectedWallet } from "@terra-money/wallet-provider";
import { useAnchorLiquidationContract } from "hooks/useAnchorLiquidationContract";
import { useEffect, useState } from "react";
import {
    CreateTxFailed,
    Timeout,
    TxFailed,
    TxResult,
    TxUnspecifiedError,
    UserDenied,
} from "@terra-money/wallet-provider";
import 'components/free-willy/liquidation-withdrawals.css';
import useNetwork from "hooks/useNetwork";
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from "@mui/material";

export default function LiquidationWithdrawals() {
    const network = useNetwork();
    const {getFilledBidsPendingClaimAmount, claimLiquidations} = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    
    const connectedWallet = useConnectedWallet();
    
    interface Collaterals {
        bluna: number,
        beth: number
    }
    
    const [collaterals, setCollaterals] = useState<Collaterals | null>();
    const [txInfo, setTxInfo] = useState<TxResult | null>();
    const [txError, setTxError] = useState<string | null>();
    const [open, setOpen] = useState<boolean>(false);
    
    const formatCollateralAmount = (bidAmount: number) => {
        return (bidAmount / 1000000);
    }
    
    const claim = (contract: string) => {
        setOpen(true);
        claimLiquidations(contract).then(data => {
            setTxInfo(data);
        }).catch((error: unknown) => {
            if (error instanceof UserDenied) {
                setTxError('User Denied');
            } else if (error instanceof CreateTxFailed) {
                setTxError('Create Tx Failed: ' + error.message);
            } else if (error instanceof TxFailed) {
                setTxError('Tx Failed: ' + error.message);
            } else if (error instanceof Timeout) {
                setTxError('Timeout');
            } else if (error instanceof TxUnspecifiedError) {
                setTxError('Unspecified Error: ' + error.message);
            } else {
                setTxError(
                    'Unknown Error: ' +
                    (error instanceof Error ? error.message : String(error)),
                    );
                }
            });
        }
        
        const handleClose = () => {
            setTxInfo(null);
            setOpen(false);
        }
        
        
        useEffect(() => {
            if (connectedWallet) {
                const bethCollateralAmountPromise = getFilledBidsPendingClaimAmount(network.contracts.beth);
                const blunaCollateralAmountPromise = getFilledBidsPendingClaimAmount(network.contracts.bluna);
                
                Promise.all([bethCollateralAmountPromise, blunaCollateralAmountPromise]).then((data) => {
                    const [bethCollateral, blunaCollateral] = data;
                    setCollaterals(
                        {
                            bluna: formatCollateralAmount(blunaCollateral),
                            beth: formatCollateralAmount(bethCollateral)
                        })
                        console.log(collaterals)
                    })
                } else {
                    setCollaterals(null);
                }
            }, [connectedWallet, txInfo, network])
            
            return (
                <>
                <Stack padding="10px">
                <Typography variant="h4" sx={{margin: '10px'}}>
                    Withdraw Liquidations
                </Typography>
                <Typography variant="h6">{collaterals?.bluna} bLuna</Typography>
                <Button variant="contained" onClick={() => {claim(network.contracts.bluna)}} disabled={collaterals === null || collaterals?.bluna==0}>Withdraw bLuna</Button>
                <Typography variant="h6">{collaterals?.beth} bEth</Typography>
                <Button variant="contained" onClick={() => {claim(network.contracts.beth)}} disabled={collaterals === null || collaterals?.beth==0}>Withdraw bETH</Button>
                </Stack>
                <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Withdrawal Transaction</DialogTitle>
                <DialogContent>
                {
                    <>
                    <DialogContentText id="alert-dialog-slide-description">
                    Transaction: {txInfo?.success}
                    </DialogContentText>
                    <DialogContentText id="alert-dialog-slide-description">
                    {txInfo ? 
                        <a
                        href={`https://finder.terra.money/${connectedWallet?.network.chainID}/tx/${txInfo?.result.txhash}`}
                        target="_blank"
                        rel="noreferrer"
                        >
                        Open Tx Result in Terra Finder
                        </a>
                        :
                        txError ?
                        <p>{txError}</p>
                        :
                        <p>Loading</p> 
                        //todo: loading anim
                    }
                    </DialogContentText>
                    <Stack spacing={2} direction="row" sx={{justifyContent: 'center'}}>
                    <Button variant="contained" onClick={() => {
                        handleClose();
                    }
                    }>Close</Button>
                </Stack>
                </>
            }
            </DialogContent>
            </Dialog>
            </>
            );
        }
        