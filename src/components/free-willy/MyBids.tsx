import { Button, Stack, Typography, Grid } from '@mui/material';
import { useAnchorLiquidationContract, Bid } from 'hooks/useAnchorLiquidationContract';
import useNetwork from 'hooks/useNetwork';
import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { TransactionDialog } from 'components/dialogs/TransactionDialog';
import { MsgExecuteContract } from '@terra-money/terra.js';

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

interface MyBidsProps {
    bethBids: Bid[],
    blunaBids: Bid[],
    onBidUpdate?: () => void
}

export default function MyBids(props: MyBidsProps) {
    const { bethBids = [], blunaBids = [], onBidUpdate } = props;
    const network = useNetwork();
    const [rows, setRows] = useState<BidRow[]>([]);
    const [selectionModel, setSelectionModel] = useState<BidRow[]>();
    const [retractable, setRetractable] = useState<boolean>(false);
    const [activatable, setActivatable] = useState<boolean>(false);
    const [retracting, setRetracting] = useState<boolean>(false);
    const [transactionData, setTransactionData] = useState<any>();
    const [timestamp, setTimestamp] = useState<any>();
    const { activateBids, activateMultipleCollaterals, retractBid } = useAnchorLiquidationContract(network.contracts.anchorLiquidation);


    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimestamp(Date.now() / 1000);
        }, 1000)

        return () => {
            clearInterval(intervalId);
        }
    }, [])
    
    
    useEffect(() => {
        const bids = [...bethBids, ...blunaBids];
        setRows(bids.map(bid => {
            const collateralName = (bid.collateral_token === network.contracts.bluna) ? 'bLuna' : 'bEth';
            return {
                id: bid.idx,
                amount: `${parseInt(bid.amount) / 1000000} UST`,
                premium_slot: `${bid.premium_slot.toString()}%`,
                collateral_token: collateralName,
                bid_status: bid.wait_end === null ? "Active" : timestamp > parseInt(bid.wait_end) ? "Ready for activation" : `${ Math.round((parseInt(bid.wait_end) - timestamp))} seconds until activation`
            } as BidRow;
        }))
    }, [bethBids, blunaBids, network, transactionData, timestamp])

    const activate = () => {
        setRetracting(false);
        const beth_bids = [];
        const bluna_bids = [];
        selectionModel?.forEach(row => {
            if(row.collateral_token == "bEth") {
                beth_bids.push(row.id)
            } else if(row.collateral_token == "bLuna") {
                bluna_bids.push(row.id)
            }
        });

        if(beth_bids.length > 0 && bluna_bids.length > 0) {
            setTransactionData(activateMultipleCollaterals([network.contracts.beth, network.contracts.bluna]));
        } else {
            if(beth_bids.length > 0) {
                setTransactionData([activateBids(network.contracts.beth)]);
            }
            if(bluna_bids.length > 0) {
                setTransactionData([activateBids(network.contracts.bluna)]);
            }
        }
    }

    const retract = () => {
        setRetracting(true)
        const bids_to_retract: MsgExecuteContract[] = []
        selectionModel?.forEach(row => {
            bids_to_retract.push(retractBid(row.id));
        });
        setTransactionData(bids_to_retract)
    }

    const success = () => {
        if(onBidUpdate) {
            onBidUpdate();
        }
    }

    const selectionChange = (ids: Iterable<any>) => {
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
    }

    return (
        <Stack sx={{padding: '10px'}}>
            <Grid container alignItems="center">
                <Grid item md={8} xs={6}>
                    <Typography variant="h5" sx={{margin: '10px'}}>
                            My Bids
                    </Typography>
                </Grid>
                <Grid item md={4} xs={6} alignItems="right">
                    <Button sx={{margin:"5px"}} variant="contained" disabled={!retractable} onClick={retract}>Retract Bid{selectionModel?.length!=1?"s":""}</Button>
                    <Button sx={{margin:"5px"}} variant="contained" disabled={!activatable} onClick={activate}>Activate Bid{selectionModel?.length!=1?"s":""}</Button>
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
                        selectionChange(ids);
                    }}
                />
            </div>
            {transactionData && 
                <TransactionDialog title={retracting ? "Bid Retraction" : "Bid Activation"} msgs={transactionData} onSuccess={success} onClose={() => setTransactionData(undefined)}/>
            }
        </Stack>  
    );
}
