import { Button, Stack, Typography, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import { useConnectedWallet } from '@terra-money/wallet-provider';
import { useAnchorLiquidationContract } from 'hooks/useAnchorLiquidationContract';
import useNetwork from 'hooks/useNetwork';
import { useState } from 'react';
import { TransactionDialog } from 'components/dialogs/TransactionDialog';

enum Markets {
    bluna, beth
}

const MIN_PREMIUM = 1;
const MAX_PREMIUM = 30;

interface PlaceBidProps {
    uusdBalance: number,
    onBidPlaced?: () => void
}

export default function PlaceBid(props: PlaceBidProps) {
    const { uusdBalance, onBidPlaced } = props;
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const [market, setMarket] = useState<Markets>(Markets.bluna);
    const [premium, setPremium] = useState<number>(1);
    const [bid, setBid] = useState<number>(0);
    const [transactionData, setTransactionData] = useState<any>();
    
    const { submitBid } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);

    const fromMicro = (value: number) => {
        return value / 1000000;
    }

    const toMicro = (value: number) => {
        return value * 1000000;
    }

    const onPremiumChange = (e: any) => {
        const newPremium = Math.min(Math.max(Math.round(parseInt(e.target.value)), MIN_PREMIUM), MAX_PREMIUM);
        setPremium(newPremium);
    }

    const onBidAmountChange = (e: any) => {
        const newBid = Math.min(Math.max(parseFloat(e.target.value), 0), fromMicro(uusdBalance));
        setBid(newBid)
    }

    const onMarketChange = (e: any) => {
        setMarket(parseInt(e.target.value) as Markets)
    }

    const onPlaceBid = () => {
        if (canBid()) {
            const collateralToken = (market === Markets.bluna) ? network.contracts.bluna : network.contracts.beth;
            setTransactionData(submitBid(toMicro(bid), collateralToken, premium));
        }
    }

    const canBid = () => {
        if (!wallet) {
            return false;
        }
        if (bid <= 0 || bid > fromMicro(uusdBalance)) {
            return false;
        }
        if (premium < MIN_PREMIUM || premium > MAX_PREMIUM) {
            return false;
        }
        return true;
    }

    const onBidSuccessful = () => {
        if (onBidPlaced) {
            onBidPlaced();
        }
    }

    return (
        <Stack spacing={1} sx={{padding: '10px'}}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Typography variant="h4" sx={{margin: '10px'}}>
                    Place Bid
                </Typography>
                <Button variant="contained" onClick={() => setBid(uusdBalance / 1000000)}>{uusdBalance / 1000000} UST</Button>
            </Stack>
            <InputLabel id="market-select-label">Collateral Market</InputLabel>
            <Select
                value={market}
                onChange={onMarketChange}
            >
                <MenuItem value={Markets.bluna}>bLuna</MenuItem>
                <MenuItem value={Markets.beth}>bEth</MenuItem>
            </Select>
            <TextField
                id="filled-number"
                label="Premium (%)"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    step: 1,
                    min: MIN_PREMIUM,
                    max: MAX_PREMIUM
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
                    max: fromMicro(uusdBalance)
                }}
                onChange={onBidAmountChange}
                value={bid}
                variant="filled"
            />
            <Button disabled={!canBid()} variant="contained" onClick={onPlaceBid} >Place Bid</Button>
            {transactionData && 
                <TransactionDialog title="Place Bid" msgs={[transactionData]} onSuccess={onBidSuccessful} onClose={() => setTransactionData(undefined)}/>
            }
        </Stack>
    );
  }
