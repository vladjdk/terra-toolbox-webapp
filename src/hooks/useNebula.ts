import { AccAddress, Coins, MsgExecuteContract } from "@terra-money/terra.js";
import { useLCDClient, useWallet } from "@terra-money/wallet-provider";
import useFee from "./useFee";
import useAddress from "./useAddress";

export interface ClusterState {
    outstanding_balance_tokens: string,
    prices: [string],
    inv: [string],
    penalty: string,
    cluster_token: string,
    target: Target
    cluster_contract_address: string,
    active: boolean
}

export interface Target {
    info: NativeToken | Token,
    amount: string
}

export interface NativeToken {
    denom: string
}

export interface Token {
    token: ContractAddress
}

export interface ContractAddress {
    contract_addr: string
}
  
export const useNebula = (contractAddress: AccAddress) => {
    const { post } = useWallet();
    // TODO: Calculate fee via simulation if possible.
    const fee = useFee();
    const userWalletAddr = useAddress();
    const lcdClient = useLCDClient();

    function _query<T>(queryMsg: any) {
        return lcdClient.wasm.contractQuery<T>(contractAddress, queryMsg);
    }

    function _createExecuteMsg(executeMsg: any, coins?: Coins.Input) {
        return new MsgExecuteContract(
            userWalletAddr,
            contractAddress,
            executeMsg,
            coins
        );
    }

    function getClusterState(): Promise<ClusterState> {
        return _query<ClusterState>({
            target: {}
        })
    }

    return {
        getClusterState
    };
};
  