import LiquidationWithdrawals from 'components/free-willy/LiquidationWithdrawals';
import LiquidationBidChart from 'components/free-willy/LiquidationBidChart';
import PlaceBid from 'components/free-willy/PlaceBid';
import MyBids from 'components/free-willy/MyBids';
import { Container, Paper, Grid } from '@mui/material';

export function FreeWilly() {
    return (
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Grid container spacing={2} >
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3}>
                        <LiquidationBidChart/>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3}>
                        <PlaceBid />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3}>
                        <LiquidationWithdrawals />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3}>
                        <MyBids />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
  }
