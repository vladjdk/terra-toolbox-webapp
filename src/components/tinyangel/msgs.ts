import { MsgSend, MsgWithdrawDelegatorReward } from "@terra-money/terra.js";

export const donateTinyAmount = (sender: string, receiver: string, balances: any ): MsgSend[] => {

    return [new MsgSend(
        sender,
        receiver,
        balances,
    )]
}

export const claimReward = (delegator: string, validators: string[]): MsgWithdrawDelegatorReward[] => {

    return validators.map(validator_address => 
        new MsgWithdrawDelegatorReward(
        delegator,
        validator_address
    ))
}