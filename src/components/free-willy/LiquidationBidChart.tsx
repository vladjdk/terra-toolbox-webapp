import { Typography, Stack } from "@mui/material";
import { useAnchorLiquidationContract } from "hooks/useAnchorLiquidationContract";
import useNetwork from "hooks/useNetwork";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
};

export default function LiquidationBidChart() {
    const network = useNetwork();
    const {getBidPoolsByCollateral} = useAnchorLiquidationContract(network.contracts.anchorLiquidation);
    const [data, setData] = useState<any>();

    const formatRate = (rate: string) => {
        return `${(Math.round(parseFloat(rate) * 100)).toString()}%`;
    }

    const formatBidAmount = (bidAmount: string) => {
        return (parseInt(bidAmount) / 1000000).toFixed(6);
    }

    useEffect(() => {
        const bethPoolsPromise = getBidPoolsByCollateral(network.contracts.beth);
        const blunaPoolsPromise = getBidPoolsByCollateral(network.contracts.bluna);
        Promise.all([bethPoolsPromise, blunaPoolsPromise]).then(data => {
            const [bethPools, blunaPools] = data;
            const labels = bethPools.bid_pools.map(pool => formatRate(pool.premium_rate));
            setData({
                labels,
                datasets: [
                  {
                    label: 'bLuna Bids',
                    data: blunaPools.bid_pools.map(pool => formatBidAmount(pool.total_bid_amount)),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  },
                  {
                    label: 'bEth Bids',
                    data: bethPools.bid_pools.map(pool => formatBidAmount(pool.total_bid_amount)),
                    backgroundColor: 'rgba(132, 99, 255, 0.5)',
                  }
                ],
            })
        })
    }, []);

    const renderGraph = () => {
        if (data) {
            return (
                <Stack sx={{padding: '10px'}}>
                    <Typography variant="h4" sx={{margin: '10px'}}>
                        Liquidation Bids
                    </Typography>
                    <Bar
                        options={options}
                        data={data}
                    />
                </Stack>
            )
        } else {
            // TODO: Add loading animation.
            return (<></>)
        }
    }

    return (
        <>{renderGraph()}</>
    )
}
