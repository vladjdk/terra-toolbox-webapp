import axios from "axios";
import { Container, Grid, Paper, Stack, Typography, Button, Slider } from "@mui/material";
import { MsgWithdrawDelegatorReward, MsgSend } from "@terra-money/terra.js"
import { TransactionDialog } from "components/dialogs/TransactionDialog"
import { useEffect, useState } from "react"
import { useLCDClient, useWallet } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { claimReward, donateTinyAmount } from "./msgs";
import { ANGEL_PROTO_ADDRESS_MAIN, visualDenomName } from "../../constants";
import { useEffectOnce, useSetState } from "react-use";
import type { RewardState, NativeWalletState } from "./types";

//chain <-> ui amount ratio converters
const toTerraAmount = (amount: number | string): number => + amount / 1000000
const toChainAmount = (amount: number | string): number => + amount * 1000000

const TinyAngel = (): JSX.Element => {
    /* modular constants for tiny-angel */
    const marks = [{ value: 0.5, label: "0.5" }, { value: 5, label: "5.0" }]
    const ustSwapRateQuery = "https://fcd.terra.dev/v1/market/swaprate/uusd"
    const lowerlimit = 0.000001 //below this amount in UST will not be donatable
    const general_ust_fee = toChainAmount(0.04); //for native balance error

    const LCD = useLCDClient();
    const user_address = useAddress();
    const { status } = useWallet();

    const [mapPopulated, setMapPopulated] = useState<boolean>(false);
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
    const ustValue = (e: any) => Number( e.amount ) / ustSwapRateMap.get(e.denom || "uusd")

    //for slider
    const valueText = (value: number) => `${value} UST`;

    //calculate sum of total donatables
    const sumOf = (donatables: any[]): string => toTerraAmount(donatables.map(b => ustValue(b)).reduce((p, c) => p + c, 0)).toFixed(2)

    //function to update native tokens to donate on slider change
    const tinyBalanceSetter = async () => {
        if ( !user_address || !mapPopulated ) {
            setNativeWalletState({ tinyBalances: [] });
            return;
        }

        const [coins] = await LCD.bank.balance(user_address);
        const tinyBalances = coins.toData()
        .filter(coin => 
        ustValue(coin) >= toChainAmount(lowerlimit)
        && ustValue(coin) < toChainAmount(nativeWalletState.tinyValue));

        tinyBalances.forEach((coin, index) => {
            if (coin.denom === "uusd") {
                + coin.amount > general_ust_fee ? 
                coin.amount = `${+ coin.amount - general_ust_fee}` :
                tinyBalances.splice(index, 1)
            }
        })

        setNativeWalletState({ tinyBalances });
    }

    //function to update available rewards to donate on slider change
    const rewardStateSetter = async () => {
        if ( !user_address || !mapPopulated ) {
            setRewardState({ totalRewards: [] });
            return;
        }

        const { total: totalRewards } = await LCD.distribution.rewards(user_address)
        let relevantRewards = totalRewards.toData()
        .filter(reward => ustValue(reward) >= toChainAmount(lowerlimit) 
        && ustValue(reward) < toChainAmount(rewardState.tinyReward) )

        relevantRewards = relevantRewards.map((el: any) => {
            return {
                ...el,
                amount: Math.floor(el.amount)
            }
        })

        setRewardState({ totalRewards: relevantRewards })
    }

    const remove = (type: string, denom: string) => {
        if ( type === "native" ) {
            setNativeWalletState(prev => ({ tinyBalances: prev.tinyBalances.filter(coin => coin.denom !== denom)}))
        } else {
            setRewardState(prev => ({ totalRewards: prev.totalRewards.filter(coin => coin.denom !== denom)}))
        }
    }

    //refetch reward / native token state on tx success to sync UI
    const refetchUserState = () => {
        tinyBalanceSetter()
        rewardStateSetter()
    }

    /* postable msgs populator */
    const onDonate = async () => {
        if ( nativeWalletState.tinyBalances.length === 0 ) {
            return;
        }

        const balancesObj = nativeWalletState.tinyBalances.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const msgs = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_MAIN, balancesObj)
        setMsgs(msgs);
    }

    const onRewardDonate = () => {
        if( rewardState.validatorAddresses.length === 0 ) {
            return;
        }

        const msgs: (MsgSend | MsgWithdrawDelegatorReward)[] 
        = claimReward(user_address, rewardState.validatorAddresses)

        if ( rewardState.totalRewards.length !== 0 ) {
            const tinyRewardsObj = rewardState.totalRewards.reduce((obj, el) => {
                return Object.assign(obj, { [el.denom]: el.amount })
            }, {})

            const [ sendRewardsToAngelMsg ] = donateTinyAmount(user_address, ANGEL_PROTO_ADDRESS_MAIN, tinyRewardsObj);
            msgs.push(sendRewardsToAngelMsg);
        }

        setMsgs(msgs)
    }
    /* postable msgs populator */

    useEffect(() => {
        if (!user_address) return;

        ;(async () => {
            /* UST Swaprate to calculate all denominations into appropriate unified tiny amount limit */
            const { data: swaprates } = await axios.get(ustSwapRateQuery);
            const swapMap = swaprates.reduce((map: any, obj: any) => { map.set(obj.denom, obj.swaprate); return map; }, new Map([["uusd", 1]]));
            setUstSwapRateMap(swapMap);

            /* fetch and store all validator addresses user has staked to */
            const [delegations] = await LCD.staking.delegations(user_address)
            const validatorAddresses = delegations.map(e => e.validator_address);
            setRewardState({ validatorAddresses })

            setMapPopulated(true);
        })();
    }, [ user_address ]);

    //native token threshold slider callback
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined || !mapPopulated ) return;

        const getTinyBalances = setTimeout(tinyBalanceSetter, 200)
        return () => clearTimeout(getTinyBalances);
    }, [ user_address, nativeWalletState.tinyValue, ustSwapRateMap, mapPopulated ]);

    //rewards threshold slider callback
    useEffect(() => {
        if ( !user_address || ustSwapRateMap === undefined || !mapPopulated ) return;

        const getTotalRewards = setTimeout(rewardStateSetter, 200);
        return () => clearTimeout(getTotalRewards);
    }, [ user_address, rewardState.tinyReward, rewardState.validatorAddresses, ustSwapRateMap, mapPopulated ])

    useEffect( refetchUserState , [ status ])

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
                                getAriaValueText={valueText}
                                valueLabelFormat={valueText}
                                valueLabelDisplay="on"/>
                            </Stack>

                            { nativeWalletState.tinyBalances.length === 0 &&
                                <Paper elevation={0}
                                style={{ 
                                    backgroundColor: 'grey', height: '100px', 
                                    display: 'grid', placeItems: 'center',
                                    opacity: '0.5'
                                }}>
                                    No Tiny Balances
                                </Paper>
                            }

                            {nativeWalletState.tinyBalances.length > 0 && 
                                <Grid 
                                sx={{ maxHeight: '225px', overflow: 'scroll' }}
                                container 
                                gap="10px">
                                    {nativeWalletState.tinyBalances.map((balance, i) => (
                                        <Paper
                                        key={i}
                                        elevation={3}
                                        style={{ backgroundColor: 'grey' }}>
                                            <Typography 
                                            variant="inherit" 
                                            sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <img 
                                                src={`images/svg/${visualDenomName.get(balance.denom)}.svg`}
                                                style={{ height: '17.5px', width: '17.5px', marginBottom: '2.5px' }}/>
                                                &nbsp;
                                                {visualDenomName.get(balance.denom)}
                                                <button 
                                                style={{ 
                                                    backgroundColor: "transparent", border: "none", opacity: '0.7',
                                                    margin: '0 0 3px 1px', cursor: "pointer",
                                                }}
                                                onClick={() => remove("native", balance.denom)}>x</button>
                                            </Typography>
                                            
                                            <Typography variant="inherit" 
                                            sx={{margin: '10px', display: 'flex', flexDirection: 'column' }}>
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
                                {sumOf(nativeWalletState.tinyBalances)}
                                &nbsp;UST
                            </Typography>

                            <Button 
                            disabled={nativeWalletState.tinyBalances.length === 0}
                            variant="contained" 
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
                                getAriaValueText={valueText}
                                valueLabelFormat={valueText}
                                valueLabelDisplay="on"/>
                            </Stack>

                            { rewardState.totalRewards.length === 0 &&
                                <Paper elevation={0}
                                style={{ 
                                    backgroundColor: 'grey', height: '100px', 
                                    display: 'grid', placeItems: 'center',
                                    opacity: '0.5'
                                }}>
                                    No Staking Rewards
                                </Paper>
                            }

                            {rewardState.totalRewards.length > 0 && 
                                <Grid 
                                sx={{ maxHeight: '225px', overflow: 'scroll' }}
                                container 
                                gap="10px">
                                    {rewardState.totalRewards.map((reward, i) => (
                                        <Paper
                                        key={i}
                                        elevation={3}
                                        style={{ backgroundColor: 'grey' }}>
                                            <Typography variant="inherit" 
                                            sx={{ margin: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <img 
                                                src={`images/svg/${visualDenomName.get(reward.denom)}.svg`}
                                                style={{ height: '17.5px', width: '17.5px', marginBottom: '2.5px' }}/>
                                                &nbsp;
                                                {visualDenomName.get(reward.denom)}
                                                <button 
                                                style={{ 
                                                    backgroundColor: "transparent", border: "none", opacity: '0.7',
                                                    margin: '0 0 3px 1px', cursor: "pointer",
                                                }}
                                                onClick={() => remove("reward", reward.denom)}>x</button>
                                            </Typography>
                                            <Typography variant="inherit" 
                                            sx={{margin: '10px', display: 'flex', flexDirection: 'column' }}>
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
                                {sumOf(rewardState.totalRewards)}
                                &nbsp;UST
                            </Typography>

                            <Button 
                            disabled={rewardState.totalRewards.length === 0}
                            variant="contained" 
                            onClick={ onRewardDonate }>
                                Withdraw Rewards and Donate
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
        { msgs.length !== 0 && 
            <TransactionDialog title="Donating..." msgs={msgs} memo="tinyangel_toolkit" onSuccess={ refetchUserState } onClose={() => setMsgs([])}/>
        }
        </>
    )
}

export default TinyAngel