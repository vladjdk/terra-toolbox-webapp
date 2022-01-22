import { useLCDClient } from "@terra-money/wallet-provider";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { BETH_TOKEN_CONTRACT, BLUNA_TOKEN_CONTRACT, getBidPoolsByCollateral } from "scripts/anchor-liquidations";

export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
};

export default function LiquidationBidChart() {
    const lcdClient = useLCDClient();
    const [data, setData] = useState<any>();

    const formatRate = (rate: string) => {
        return `%${(Math.floor(parseFloat(rate) * 100)).toString()}`;
    }

    const formatBidAmount = (bidAmount: string) => {
        return (parseInt(bidAmount) / 1000000).toFixed(6);
    }

    useEffect(() => {
        const bethPoolsPromise = getBidPoolsByCollateral(lcdClient, BETH_TOKEN_CONTRACT);
        const blunaPoolsPromise = getBidPoolsByCollateral(lcdClient, BLUNA_TOKEN_CONTRACT);
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

    return (
        <>
            {data &&
                <Bar
                    options={options}
                    data={data}
                />
            }
        </>
    )
}
