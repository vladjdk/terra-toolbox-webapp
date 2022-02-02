import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { TransactionDialog } from "components/dialogs/TransactionDialog"
import { useEffect, useState } from "react"
import { useLCDClient } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { tinyThreshold } from "./tinyThreshold";
import { donateTinyBalances } from "./msgs";
import { ANGEL_PROTO_ADDRESS_BOMBAY, visualDenomName } from "../../constants";
import { Container, Grid, Paper, Stack, Typography, Button } from "@mui/material";

const toTerraAmount = (uamount: number | string): number => + uamount / 1000000

const TinyAngel = (): JSX.Element => {

    const [tinyBalances, setTinyBalances] = useState<any[]>([])
    const [msgs, setMsgs] = useState<MsgSend[] | MsgExecuteContract[]>([])
    const LCD = useLCDClient()
    const user_address = useAddress()

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
            const _coins = coins.toData().filter(e => Number( e.amount ) < tinyThreshold);
            setTinyBalances(_coins);
        })();
    }, [ user_address ]);

    return (
        <>
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <Stack spacing={1} sx={{padding: '10px'}}>
                            {tinyBalances.map(balance => (
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    padding="0px 15px"
                                    alignItems="center"
                                    spacing={5}
                                >
                                    <Typography variant="h5" sx={{margin: '10px'}}>
                                        {visualDenomName.get(balance.denom)}
                                    </Typography>
                                    <Typography variant="h5" sx={{margin: '10px'}}>
                                        {toTerraAmount(balance.amount)}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                        <Button variant="contained" onClick={ onDonate }>Donate all tiny balances to angel</Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: '100%'}}>
                        <div>Hello</div>
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