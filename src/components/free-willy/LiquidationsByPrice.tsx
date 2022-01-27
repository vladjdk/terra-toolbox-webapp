import { Typography, Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from 'axios';
import { useAlphaDeFi } from "hooks/useAlphaDeFi";

const options = {
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
            label:"",
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 1.0)',
            fill: true
        }
    ]
}

export default function LiquidationsByPrice() {
    const [data, setData] = useState<any>(defaultData);
    const { getLiquidationsByPrice, navigateToSite } = useAlphaDeFi(); 

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
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
                <Typography variant="h4" sx={{margin: '10px'}}>
                    Liquidations by Price
                </Typography>
                <Button variant="outlined" onClick={navigateToSite}>Powered by Alpha DeFi</Button>
            </Stack>
            <Line
                options={options}
                data={data}
            />
        </Stack>
    )
}
