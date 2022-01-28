import { Typography, Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useAlphaDeFi, LiquidationByPrice } from "hooks/useAlphaDeFi";

const options = {
    type: 'line',
    borderColor: 'rgb(132, 99, 255, 0.3)',
    responsive: true,
    plugins: {
        legend: {
            display: false
        }
    }
};

const defaultData = {
    labels: [], 
    datasets: [ 
        {
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 1.0)'
        }
    ]
}

export default function LiquidationsByPrice() {
    const [data, setData] = useState<any>(defaultData);
    const { getLiquidationsByPrice, navigateToSite } = useAlphaDeFi(); 
    const [topLiqPrice, setTopLiqPrice] = useState<number>(0);
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    }

    const highestLiquidationAmount = (lbp: Array<LiquidationByPrice>) => {
        var largestValue = 0;
        var largestNum = 0;
        lbp.forEach(value => {
            const lv = value.Loan_Value
            if(lv>largestValue) {
                largestValue = lv;
                largestNum = value.Luna_Liquidation_Price;
            }
        });
        setTopLiqPrice(Math.round(largestNum * 100) / 100)
    }

    useEffect(() => {
        getLiquidationsByPrice().then(liquidationsByPrice => {
            liquidationsByPrice.reverse();
            const labels = liquidationsByPrice.map(lbp => formatPrice(lbp.Luna_Liquidation_Price));
            const values = liquidationsByPrice.map(lbp => lbp.Loan_Value);
            setData({
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)'
                    }
                ],
            })
            highestLiquidationAmount(liquidationsByPrice);
        })
        
    }, []);

    return (
        <Stack sx={{padding: '10px'}}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
            >
                <Typography variant="h5" sx={{margin: '5px'}}>
                    Liquidations by Price
                </Typography>
                <Button variant="outlined" onClick={navigateToSite}>Powered by Alpha DeFi</Button>
            </Stack>
            <Typography variant="h6" sx={{margin: '5px'}}>
                    Highest Liquidation Wall: ${topLiqPrice}
            </Typography>
            <Line
                options={options}
                data={data}
            />
        </Stack>
    )
}
