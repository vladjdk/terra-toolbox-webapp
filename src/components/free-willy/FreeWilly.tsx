import LiquidationWithdrawals from 'components/free-willy/LiquidationWithdrawals';
import LiquidationBidChart from 'components/free-willy/LiquidationBidChart';
import PlaceBid from 'components/free-willy/PlaceBid';
import MyBids from 'components/free-willy/MyBids';
import { Container, Paper, Grid } from '@mui/material';
import useNetwork from 'hooks/useNetwork';
import { useAnchorLiquidationContract, BidPool, Bid } from 'hooks/useAnchorLiquidationContract';
import { useEffect, useState } from 'react';
import { useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import LiquidationsByPrice from './LiquidationsByPrice';

export function FreeWilly() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const lcd = useLCDClient();

    const { getBidPoolsByCollateral, getFilledBidsPendingClaimAmount, getBidsByUser } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    const [uusdBalance, setUusdBalance] = useState<number>(0);
    const [bethPools, setBethPools] = useState<BidPool[]>([]);
    const [blunaPools, setBlunaPools] = useState<BidPool[]>([]);
    const [bethBids, setBethBids] = useState<Bid[]>([]);
    const [blunaBids, setBlunaBids] = useState<Bid[]>([]);
    const [bethClaim, setBethClaim] = useState<number>(0);
    const [blunaClaim, setBlunaClaim] = useState<number>(0);

    useEffect(() => {
        getUusdBalance().then()
        getBidsPendingClaim().then()
        getUserBids().then()
    }, [wallet, network])

    useEffect(() => {
        getBidPools().then()
    }, [network])

    const getUusdBalance = async () => {
        if (wallet) {
            lcd.bank.balance(wallet.walletAddress).then(balance => {
                const [coins,] = balance;
                const uusdBalance = coins.get('uusd');
                setUusdBalance(uusdBalance ? uusdBalance.amount.toNumber() : 0);
            })
        }
    }

    const getBidPools = async () => {
        Promise.all([
            getBidPoolsByCollateral(network.contracts.beth), 
            getBidPoolsByCollateral(network.contracts.bluna)
        ]).then(data => {
            const [bethPools, blunaPools] = data;
            setBethPools(bethPools.bid_pools);
            setBlunaPools(blunaPools.bid_pools);
        });
    }

    const getBidsPendingClaim = async () => {
        if (wallet) {
            Promise.all([
                getFilledBidsPendingClaimAmount(network.contracts.beth),
                getFilledBidsPendingClaimAmount(network.contracts.bluna)
            ]).then(data => {
                const [bethClaim, blunaClaim] = data;
                setBethClaim(bethClaim);
                setBlunaClaim(blunaClaim);
            });
        }
    }

    const getUserBids = async () => {
        if (wallet) {
            Promise.all([
                getBidsByUser(network.contracts.beth),
                getBidsByUser(network.contracts.bluna)
            ]).then(data => {
                const [bethBids, blunaBids] = data;
                setBethBids(bethBids.bids);
                setBlunaBids(blunaBids.bids);
            });
        }
    }

    const onRefresh = () => {
        getUusdBalance().then()
        getBidsPendingClaim().then()
        getUserBids().then()
        getBidPools().then()
    }

    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Grid container spacing={2} >
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <LiquidationBidChart bethPools={bethPools} blunaPools={blunaPools}/>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <LiquidationsByPrice/>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <PlaceBid uusdBalance={uusdBalance} onBidPlaced={onRefresh}/>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <LiquidationWithdrawals bethClaim={bethClaim} blunaClaim={blunaClaim} onClaim={onRefresh}/>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <MyBids bethBids={bethBids} blunaBids={blunaBids} onBidUpdate={onRefresh}/>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
  }
