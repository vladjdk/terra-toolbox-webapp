import LiquidationWithdrawals from 'components/free-willy/LiquidationWithdrawals';
import LiquidationBidChart from 'components/free-willy/LiquidationBidChart';
import PlaceBid from 'components/free-willy/PlaceBid';
import MyBids from 'components/free-willy/MyBids';
import { Container, Paper, Grid } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useAnchorLiquidationContract, BidPool, Bid } from 'hooks/useAnchorLiquidationContract';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';

export function FreeWilly() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();

    useEffect(() => {
        
    }, [wallet, network])

    const onRefresh = () => {
        
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
        </Container>
    );
  }
