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
import useNetwork from "hooks/useNetwork";
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, Stack, Typography } from "@mui/material";

interface LiquidationWithdrawalsProps {
    bethClaim: number,
    blunaClaim: number,
    onClaim?: () => void
}

interface Collaterals {
    bluna: number,
    beth: number
}

export default function LiquidationWithdrawals(props: LiquidationWithdrawalsProps) {
    const {bethClaim = 0, blunaClaim = 0, onClaim} = props;
    const network = useNetwork();
    const { claimLiquidations } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    const connectedWallet = useConnectedWallet();
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
            if (onClaim) {
                onClaim();
            }
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
                setCollaterals({
                    bluna: formatCollateralAmount(blunaClaim),
                    beth: formatCollateralAmount(bethClaim)
                })
            }, [blunaClaim, bethClaim])
            
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
        