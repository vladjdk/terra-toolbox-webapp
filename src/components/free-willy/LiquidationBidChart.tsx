import { Typography, Stack } from "@mui/material";
import { BidPool } from "hooks/useAnchorLiquidationContract";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { primaryTextColor } from 'theme';

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: primaryTextColor
        }
      },
    },
    scales: {
        yAxes: {
            ticks: {
                color: primaryTextColor
            },
        },
        xAxes: {
            ticks: {
                color: primaryTextColor
            },
        }
    },
    
};

const defaultData = {
    labels: new Array(31).fill(0).map((value, index) => `${index}%`), 
    datasets: [ 
        {
            label:"",
            data:new Array(31).fill(0)
        }
    ]
}

interface LiquidationBidChartProps {
    bethPools: BidPool[],
    blunaPools: BidPool[]
}

export default function LiquidationBidChart(props: LiquidationBidChartProps) {
    const {bethPools = [], blunaPools = []} = props;
    const [data, setData] = useState<any>(defaultData);

    const formatRate = (rate: string) => {
        return `${(Math.round(parseFloat(rate) * 100)).toString()}%`;
    }

    const formatBidAmount = (bidAmount: string) => {
        return (parseInt(bidAmount) / 1000000).toFixed(6);
    }

    useEffect(() => {
        const labels = bethPools.map(pool => formatRate(pool.premium_rate));
        setData({
            labels,
            datasets: [
                {
                    label: 'bLuna Bids',
                    data: blunaPools.map(pool => formatBidAmount(pool.total_bid_amount)),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)'
                },
                {
                    label: 'bEth Bids',
                    data: bethPools.map(pool => formatBidAmount(pool.total_bid_amount)),
                    backgroundColor: 'rgba(132, 99, 255, 0.5)'
                }
            ],
        })
    }, [bethPools, blunaPools]);

    return (
        
        <Stack direction='column' alignItems='flex-start' justifyContent='space-between' spacing={4} sx={{padding: '10px'}}>
            <Typography variant="h5" sx={{margin: '10px'}}>
                Liquidation Bids
            </Typography>
            <Bar 
                options={options}
                data={data}
            />
        </Stack>
    )
}
