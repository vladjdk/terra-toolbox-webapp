import { MsgSend } from "@terra-money/terra.js";

export const donateTinyBalances = (sender: string, receiver: string, balances: any ): MsgSend[] => {

    return [new MsgSend(
        sender,
        receiver,
        balances,
    )]
}