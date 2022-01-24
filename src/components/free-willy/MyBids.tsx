import { Button, Stack, Typography, TextField, Divider, Grid } from '@mui/material';
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
    },
    {
        field: 'bid_status',
        headerName: 'Bid Status',
        width: 200
    }
];

interface BidRow {
    id: string,
    amount: string,
    premium_slot: string,
    collateral_token: string,
    bid_status: string
}

export default function MyBids() {
    const network = useNetwork();
    const wallet = useConnectedWallet();
    const [rows, setRows] = useState<BidRow[]>([]);
    const [selectionModel, setSelectionModel] = useState<BidRow[]>();
    const [retractable, setRetractable] = useState<boolean>(false);
    const [activatable, setActivatable] = useState<boolean>(false);
    const { activateBids, activateMultipleCollaterals, getBidsByUser } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    
    useEffect(() => {
        if (wallet) {
            const timestamp = Date.now()
            const bethBidsPromise = getBidsByUser(network.contracts.beth);
            const blunaBidsPromise = getBidsByUser(network.contracts.bluna);
            Promise.all([bethBidsPromise, blunaBidsPromise]).then(data => {
                const [bethBids, blunaBids] = data;
                const bids = [...bethBids.bids, ...blunaBids.bids];
                setRows(bids.map(bid => {
                    console.log(timestamp/1000)
                    console.log(bid.wait_end)
                    const collateralName = (bid.collateral_token === network.contracts.bluna) ? 'bLuna' : 'bEth';
                    return {
                        id: bid.idx,
                        amount: `${parseInt(bid.amount) / 1000000} UST`,
                        premium_slot: `${bid.premium_slot.toString()}%`,
                        collateral_token: collateralName,
                        bid_status: bid.wait_end === null ? "Active" : timestamp > parseInt(bid.wait_end)*1000 ? "Ready for activation" : `${ Math.floor((parseInt(bid.wait_end)*1000 - timestamp) / 1000/60)} minutes until activation`
                    } as BidRow;
                }))
            })
        }
    }, [wallet, network])

    const activate = () => {
        var beth_bids = [];
        var bluna_bids = [];
        selectionModel?.forEach(row => {
            if(row.collateral_token == "bEth") {
                beth_bids.push(row.id)
            } else if(row.collateral_token == "bLuna") {
                bluna_bids.push(row.id)
            }
        });

        if(beth_bids.length > 0 && bluna_bids.length > 0) {
            activateMultipleCollaterals([network.contracts.beth, network.contracts.bluna])
        } else {
            if(beth_bids.length > 0) {
                activateBids(network.contracts.beth);
            }
    
            if(bluna_bids.length > 0) {
                activateBids(network.contracts.bluna);
            }
        }


    }

    return (
        <Stack sx={{padding: '10px'}}>
            <Grid container alignItems="center">
                <Grid item md={9} xs={6}>
                    <Typography variant="h4" sx={{margin: '10px'}}>
                            My Bids
                    </Typography>
                </Grid>
                <Grid item md={3} xs={6} alignItems="right">
                    <Button disabled={!retractable}>Retract Bid</Button>
                    <Button disabled={!activatable} onClick={activate}>Activate Bid</Button>
                </Grid>
            </Grid>

            <div style={{ height: 300 }}>
                <DataGrid
                    sx={{
                        '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                    rows={rows}
                    columns={columns}
                    pageSize={30}
                    rowsPerPageOptions={[30]}
                    checkboxSelection
                    disableColumnSelector
                    disableDensitySelector
                    onSelectionModelChange={(ids) => {
                        const selectedIDs = new Set(ids);
                        const selectedRowData = rows.filter((row) => selectedIDs.has(row.id.toString()));
                        setSelectionModel(selectedRowData);
                        if(selectedRowData.length>0) {
                            setRetractable(true)
                            var a = true;
                            selectedRowData.forEach(row => {
                                if (row.bid_status != "Ready for activation") {
                                    a = false;
                                }
                            });
                            setActivatable(a)
                        } else {
                            setRetractable(false)
                            setActivatable(false)
                        }
                        console.log(activatable)
                        console.log(retractable)
                    }}
                />
            </div>
        </Stack>
    );
}
