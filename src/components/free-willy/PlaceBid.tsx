import { Button, Stack, Typography, TextField } from '@mui/material';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import { useAnchorLiquidationContract } from 'hooks/useAnchorLiquidationContract';
import useNetwork from 'hooks/useNetwork';
import { useEffect, useState } from 'react';

export default function PlaceBid() {
    const network = useNetwork();
    const lcd = useLCDClient();
    const wallet = useConnectedWallet();
    const [uusdBalance, setUusdBalance] = useState<number>(0);
    const [premium, setPremium] = useState<number>(0)
    
    const { submitBid } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);

    useEffect(() => {
        if (wallet) {
            lcd.bank.balance(wallet.walletAddress).then(balance => {
                const [coins,] = balance;
                const uusdBalance = coins.get('uusd');
                setUusdBalance(uusdBalance ? uusdBalance.amount.toNumber() : 0);
            })
        }
    }, [wallet, network])

    const onPremiumChange = (e: any) => {
        const newPremium = Math.min(Math.max(Math.round(parseInt(e.target.value)), 0), 30);
        console.log(newPremium)
    }

    return (
        <Stack sx={{padding: '10px'}}>
            <Typography variant="h4" sx={{margin: '10px'}}>
                Place Bids {uusdBalance / 1000000}
            </Typography>
            <TextField
                id="filled-number"
                label="Premium (%)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    step: 1,
                    min: 0,
                    max: 30
                }}
                onChange={onPremiumChange}
                value={premium}
                variant="filled"
            />
            <TextField
                id="filled-number"
                label="Bid amount (UST)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    min: 0,
                    max: uusdBalance
                }}
                variant="filled"
            />
            <Button variant="contained">Place Bid</Button>
        </Stack>
    );
  }
