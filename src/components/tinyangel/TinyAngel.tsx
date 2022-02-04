import axios from "axios";
import { Container, Grid, Paper, Stack, Typography, Button, Slider } from "@mui/material";
import { MsgWithdrawDelegatorReward, MsgSend } from "@terra-money/terra.js"
import { TransactionDialog } from "components/dialogs/TransactionDialog"
import { useEffect, useState } from "react"
import { useLCDClient } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { claimReward, donateTinyAmount } from "./msgs";
import { ANGEL_PROTO_ADDRESS_BOMBAY, visualDenomName } from "../../constants";
import { useEffectOnce, useSetState } from "react-use";
import type { RewardState, NativeWalletState } from "./types";

//chain <-> ui amount ratio converters
const toTerraAmount = (amount: number | string): number => + amount / 1000000
const toChainAmount = (amount: number | string): number => + amount * 1000000

const TinyAngel = (): JSX.Element => {
    /* modular constants for tiny-angel */
    const marks = [{ value: 0.5, label: "0.5" }, { value: 5, label: "5.0" }]
    const ustSwapRateQuery = "https://fcd.terra.dev/v1/market/swaprate/uusd"
    const lowerlimit = 0.01 //below this amount in UST will not be donatable

    const LCD = useLCDClient()
    const user_address = useAddress()

    const [ustSwapRateMap, setUstSwapRateMap] = useState<any>(undefined)
    const [msgs, setMsgs] = useState<(MsgSend | MsgWithdrawDelegatorReward)[]>([])

    const [nativeWalletState, setNativeWalletState] 
    = useSetState<NativeWalletState>({
        tinyBalances: [],
        tinyValue: 2.5,
    })

    const [rewardState, setRewardState]
    = useSetState<RewardState>({
        validatorAddresses: [],
        tinyReward: 2.5,
        totalRewards: [],
    })

    //conversion of tokens to corresponding UST value
    const ustValue = (e: any) => Number( e.amount ) / ustSwapRateMap.get(e.denom)

    //function to update native tokens to donate on slider change
    const tinyBalanceSetter = async () => {
        const [coins] = await LCD.bank.balance(user_address);
        const tinyBalances = coins.toData()
        .filter(coin => ustValue(coin) >= toChainAmount(lowerlimit) 
        && ustValue(coin) < toChainAmount(nativeWalletState.tinyValue));

        setNativeWalletState({ tinyBalances });
    }

    //function to update available rewards to donate on slider change
    const rewardStateSetter = async () => {
        const { total: totalRewards } = await LCD.distribution.rewards(user_address)
        let relevantRewards = totalRewards.toData()
        .filter(reward => ustValue(reward) >= toChainAmount(lowerlimit) 
        && ustValue(reward) < toChainAmount(rewardState.tinyReward) )

        relevantRewards = relevantRewards.map((el: any) => {
            return {
                ...el,
                amount: parseInt(el.amount)
            }
        })

        setRewardState({ totalRewards: relevantRewards })
    }

    //refetch reward / native token state on tx success to sync UI
    const refetchUserState = () => {
        tinyBalanceSetter()
        rewardStateSetter()
    }

    /* postable msgs populator */
    const onDonate = async () => {
        if ( nativeWalletState.tinyBalances.length === 0 ) {
            alert("You don't have any tiny balances to donate");
            return;
        }

        const balancesObj = nativeWalletState.tinyBalances.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const msgs = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, balancesObj)
        setMsgs(msgs);
    }

    const onRewardDonate = () => {
        if( rewardState.validatorAddresses.length === 0 ) {
            alert("You don't have any rewards to withdraw");
            return;
        }

        const msgs: (MsgSend | MsgWithdrawDelegatorReward)[] 
        = claimReward(user_address, rewardState.validatorAddresses)

        if ( rewardState.totalRewards.length !== 0 ) {
            const tinyRewardsObj = rewardState.totalRewards.reduce((obj, el) => {
                return Object.assign(obj, { [el.denom]: el.amount })
            }, {})

            const [ sendRewardsToAngelMsg ] = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, tinyRewardsObj);
            msgs.push(sendRewardsToAngelMsg);
        }

        setMsgs(msgs)
    }
    /* postable msgs populator */

    //Run once on load
    useEffectOnce(() => {
        ;(async () => {
            /* UST Swaprate to calculate all denominations into appropriate unified tiny amount limit */
            const { data: swaprates } = await axios.get(ustSwapRateQuery);
            const swapMap = swaprates.reduce((map: any, obj: any) => { map.set(obj.denom, obj.swaprate); return map; }, new Map);
            setUstSwapRateMap(swapMap);

            /* fetch and store all validator addresses user has staked to */
            const [delegations] = await LCD.staking.delegations(user_address)
            const validatorAddresses = delegations.map(e => e.validator_address);
            setRewardState({ validatorAddresses })
        })();
    })

    //native token threshold slider callback
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined ) return;

        const getTinyBalances = setTimeout(tinyBalanceSetter, 200)
        return () => clearTimeout(getTinyBalances);
    }, [ user_address, nativeWalletState.tinyValue, ustSwapRateMap ]);

    //rewards threshold slider callback
    useEffect(() => {
        if ( !user_address ) return;

        const getTotalRewards = setTimeout(rewardStateSetter, 200);
        return () => clearTimeout(getTotalRewards);
    }, [ user_address, rewardState.tinyReward, rewardState.validatorAddresses ])

    return (
        <>
        <Container sx={{maxWidth: '1200px', padding: '10px'}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: 'fit-content'}}>
                        <Stack spacing={1} sx={{padding: '30px'}}>
                            <Typography 
                            variant="h6" 
                            width="100%" 
                            textAlign="left">
                                Donate Tiny Wallet Balance
                            </Typography>

                            <p style={{ textAlign: 'left', opacity: '0.7' }}>
                                Give the angel dust in your wallet (tokens with value under a small threshold) to charity.
                            </p>

                            <Stack
                            padding="15px 0">
                                <Typography>
                                    Tiny Balance Threshold
                                </Typography>
                                <Slider 
                                onChange={(e: any) => setNativeWalletState({ tinyValue: +e.target.value })}
                                color="primary"
                                min={0.5} 
                                max={5}
                                defaultValue={2.5}
                                marks={marks}
                                step={0.1}
                                valueLabelDisplay="on"/>
                            </Stack>

                            { nativeWalletState.tinyBalances.length === 0 &&
                                <Typography>No Tiny Balances</Typography>
                            }

                            {nativeWalletState.tinyBalances.length > 0 && 
                                <Grid 
                                sx={{ maxHeight: '225px', overflow: 'scroll' }}
                                container 
                                gap="10px">
                                    {nativeWalletState.tinyBalances.map(balance => (
                                        <Paper
                                        elevation={3}
                                        style={{ backgroundColor: 'grey' }}>
                                            <Typography variant="inherit" sx={{margin: '10px'}}>
                                                {visualDenomName.get(balance.denom)}
                                            </Typography>
                                            <Typography variant="inherit" sx={{margin: '10px', display: 'flex', flexDirection: 'column' }}>
                                                <span>{toTerraAmount(balance.amount).toFixed(6)}</span>
                                                <span style={{ fontSize: '12px' }}>
                                                ≈ {toTerraAmount(ustValue(balance)).toFixed(2)} UST
                                                </span>
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Grid>
                            }

                            <br/>
                            <Typography sx={{ fontSize: '15px' }}>
                                Total Donation Amount: &nbsp;
                                {toTerraAmount(nativeWalletState.tinyBalances.map(b => ustValue(b)).reduce((p, c) => p + c, 0)).toFixed(2)}
                                UST
                            </Typography>

                            <Button variant="contained" 
                            onClick={ onDonate }>
                                Donate
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} style={{height: 'fit-content'}}>
                        <Stack spacing={1} sx={{padding: '30px'}}>
                            <Typography 
                            variant="h6" 
                            width="100%" 
                            textAlign="left">
                                Donate Tiny Rewards from Staking
                            </Typography>

                            <p style={{ textAlign: 'left', opacity: '0.7' }}>
                                Withdraw your luna staking rewards and give rewards with small balance to charity.
                            </p>

                            <Stack
                            padding="15px 0">
                                <Typography>
                                    Tiny Reward Threshold
                                </Typography>
                                <Slider 
                                onChange={(e: any) => setRewardState({ tinyReward: +e.target.value })}
                                color="primary"
                                min={0.5} 
                                max={5}
                                defaultValue={2.5}
                                marks={marks}
                                step={0.1}
                                valueLabelDisplay="on"/>
                            </Stack>

                            { rewardState.totalRewards.length === 0 &&
                                <Typography>No Staking Rewards</Typography>
                            }

                            {rewardState.totalRewards.length > 0 && 
                                <Grid 
                                sx={{ maxHeight: '225px', overflow: 'scroll' }}
                                container 
                                gap="10px">
                                    {rewardState.totalRewards.map(reward => (
                                        <Paper
                                        elevation={3}
                                        style={{ backgroundColor: 'grey' }}>
                                            <Typography variant="inherit" sx={{margin: '10px'}}>
                                                {visualDenomName.get(reward.denom)}
                                            </Typography>
                                            <Typography variant="inherit" sx={{margin: '10px', display: 'flex', flexDirection: 'column' }}>
                                                <span>{toTerraAmount(reward.amount).toFixed(6)}</span>
                                                <span style={{ fontSize: '12px' }}>
                                                ≈ {toTerraAmount(ustValue(reward)).toFixed(2)} UST
                                                </span>
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Grid>
                            }
                            
                            <br/>
                            <Typography sx={{ fontSize: '15px' }}>
                                Total Donation Amount: &nbsp;
                                {toTerraAmount(rewardState.totalRewards.map(b => ustValue(b)).reduce((p, c) => p + c, 0)).toFixed(2)}
                                UST
                            </Typography>

                            <Button variant="contained" 
                            onClick={ onRewardDonate }>
                                Withdraw Rewards and Donate
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
        { msgs.length !== 0 && 
            <TransactionDialog title="Donating..." msgs={msgs} onSuccess={ refetchUserState } onClose={() => setMsgs([])}/>
        }
        </>
    )
}

export default TinyAngel