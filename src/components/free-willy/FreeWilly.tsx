import LiquidationWithdrawals from 'components/free-willy/LiquidationWithdrawals';
import LiquidationBidChart from 'components/free-willy/LiquidationBidChart';
import PlaceBid from 'components/free-willy/PlaceBid';
import MyBids from 'components/free-willy/MyBids';
import { Container, Stack, Paper } from '@mui/material';

export function FreeWilly() {
    return (
        <Container sx={{maxWidth: '1200px'}}>
            <Stack spacing={2} sx={{margin: '10px 0px'}}>
                <Paper elevation={3}>
                    <LiquidationBidChart/>
                </Paper>
                <Paper elevation={3}>
                    <PlaceBid />
                </Paper>
                <Paper elevation={3}>
                    <MyBids />
                </Paper>
                <Paper elevation={3}>
                    <LiquidationWithdrawals />
                </Paper>
            </Stack>
        </Container>
    );
  }
