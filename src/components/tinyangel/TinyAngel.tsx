import axios from "axios";
import { Coin, MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { TransactionDialog } from "components/dialogs/TransactionDialog"
import { useEffect, useState } from "react"
import { useLCDClient } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { donateTinyBalances } from "./msgs";
import { ANGEL_PROTO_ADDRESS_BOMBAY, visualDenomName } from "../../constants";
import { Container, Grid, Paper, Stack, Typography, Button, Slider } from "@mui/material";

const toTerraAmount = (uamount: number | string): number => + uamount / 1000000
const toChainAmount = (uamount: number | string): number => + uamount * 1000000
const ustSwapRateQuery = "https://fcd.terra.dev/v1/market/swaprate/uusd"

const TinyAngel = (): JSX.Element => {

    const LCD = useLCDClient()
    const user_address = useAddress()

    const [tinyBalances, setTinyBalances] = useState<any[]>([])
    const [tinyValue, setTinyValue] = useState<number>(0.5)
    const [msgs, setMsgs] = useState<MsgSend[] | MsgExecuteContract[]>([])

    const onDonate = async () => {
        if ( tinyBalances.length === 0 ) {
            alert("You don't have any tiny balances to donate")
            return;
        }

        const balancesObj = tinyBalances.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const msgs = donateTinyBalances(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, balancesObj)
        setMsgs(msgs);
    }

    useEffect(() => {
        if ( !user_address ) return;

        ;(async () => {
            const [coins] = await LCD.bank.balance(user_address);
            const { data: swaprates } = await axios.get(ustSwapRateQuery)

            const swapMap = swaprates.reduce((map: any, obj: any) => { map.set(obj.denom, obj.swaprate); return map; }, new Map);
            const _coins = coins.toData().filter(e => Number( e.amount ) / swapMap.get(e.denom) < toChainAmount(tinyValue));

            setTinyBalances(_coins);
        })();
    }, [ user_address, tinyValue ]);

    return (
        <>
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <Stack spacing={1} sx={{padding: '30px'}}>
                            <Typography 
                            variant="h5" 
                            width="100%" 
                            textAlign="center">
                                Donate tiny balances to Angel Protocol
                            </Typography>

                            <Stack
                            padding="15px 0">
                                <Typography>
                                    Tiny Balance Threshold (in UST)
                                </Typography>
                                <Slider 
                                onChange={(e: any) => setTinyValue(+e.target.value)}
                                color="primary"
                                min={0.5} 
                                max={5}
                                step={0.1}
                                valueLabelDisplay="auto"/>
                            </Stack>

                            { tinyBalances.length === 0 &&
                                <Typography>You don't have any tiny balances</Typography>
                            }

                            {tinyBalances.length > 0 && 
                            tinyBalances.map(balance => (
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={5}
                                >
                                    <Typography variant="h6" sx={{margin: '10px'}}>
                                        {visualDenomName.get(balance.denom)}
                                    </Typography>
                                    <Typography variant="h6" sx={{margin: '10px'}}>
                                        {toTerraAmount(balance.amount)}
                                    </Typography>
                                </Stack>
                            ))}
                            <Button variant="contained" onClick={ onDonate }>Donate</Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <div>Upcoming</div>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
        { msgs.length !== 0 && 
            <TransactionDialog title="Sending Assets to Angel..." msgs={msgs} onSuccess={() => null} onClose={() => setMsgs([])}/>
        }
        </>
    )
}

export default TinyAngel