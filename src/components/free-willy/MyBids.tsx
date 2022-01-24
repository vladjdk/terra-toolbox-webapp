import { Button, Stack, Typography, TextField } from '@mui/material';
import { useAnchorLiquidationContract, Bid } from 'hooks/useAnchorLiquidationContract';
import useNetwork from 'hooks/useNetwork';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useConnectedWallet } from '@terra-money/wallet-provider';

const columns = [
    { 
        field: 'id',
        headerName: 'IDX',
        width: 90
    },
    {
        field: 'amount',
        headerName: 'Amount',
        width: 150
    },
    {
        field: 'premium_slot',
        headerName: 'Premium',
        width: 150
    },
    {
        field: 'collateral_token',
        headerName: 'Collateral Token',
        width: 150
    }
];

interface BidRow {
    id: string,
    amount: string,
    premium_slot: string,
    collateral_token: string
}

export default function MyBids() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const [rows, setRows] = useState<BidRow[]>([]);
    const { getBidsByUser } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    
    useEffect(() => {
        if (wallet) {
            const bethBidsPromise = getBidsByUser(network.contracts.beth);
            const blunaBidsPromise = getBidsByUser(network.contracts.bluna);
            Promise.all([bethBidsPromise, blunaBidsPromise]).then(data => {
                const [bethBids, blunaBids] = data;
                const bids = [...bethBids.bids, ...blunaBids.bids];
                setRows(bids.map(bid => {
                    const collateralName = (bid.collateral_token === network.contracts.bluna) ? 'bLuna' : 'bEth';
                    return {
                        id: bid.idx,
                        amount: `${parseInt(bid.amount) / 1000000} UST`,
                        premium_slot: `${bid.premium_slot.toString()}%`,
                        collateral_token: collateralName
                    } as BidRow;
                }))
            })
        }
    }, [wallet, network])

    return (
        <Stack sx={{padding: '10px'}}>
            <Typography variant="h4" sx={{margin: '10px'}}>
                My Bids
            </Typography>
            <div style={{ height: 300 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={30}
                    rowsPerPageOptions={[30]}
                    checkboxSelection
                    disableSelectionOnClick
                />
            </div>
        </Stack>
    );
}
