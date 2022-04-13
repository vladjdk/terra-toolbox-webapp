import { AccAddress, Coins, MsgExecuteContract } from "@terra-money/terra.js";
import { useLCDClient, useWallet } from "@terra-money/wallet-provider";
import useFee from "./useFee";
import useAddress from "./useAddress";

export interface ClusterState {
    outstanding_balance_tokens: string,
    prices: string[],
    inv: string[],
    penalty: string,
    cluster_token: string,
    target: Target[]
    cluster_contract_address: string,
    active: boolean
}

export interface Target {
    info: NativeToken | Token,
    amount: string
}

export interface NativeToken {
    native_token: {denom: string}
}

export interface Token {
    token: {contract_addr: string}
}

export interface ClusterInfo {
    name: string,
    description: string,
}

export interface ClusterList {
    contract_infos: any
}
  
export const useNebula = (factoryAddress: AccAddress) => {
    const { post } = useWallet();
    // TODO: Calculate fee via simulation if possible.
    const fee = useFee();
    const userWalletAddr = useAddress();
    const lcdClient = useLCDClient();

    function _queryFactory<T>(queryMsg: any) {
        return lcdClient.wasm.contractQuery<T>(factoryAddress, queryMsg);
    }

    function _queryCluster<T>( clusterAddress: AccAddress, queryMsg: any) {
        return lcdClient.wasm.contractQuery<T>(clusterAddress, queryMsg);
    }

    function _createExecuteMsg(executeMsg: any, contractAddress: string, coins?: Coins.Input) {
        return new MsgExecuteContract(
            userWalletAddr,
            contractAddress,
            executeMsg,
            coins
        );
    }

    //factory
    function getClusterList(): Promise<ClusterList> {
        return _queryFactory<ClusterList>(
            {
                cluster_list: {}
            }
        );
    }

    // cluster
    function getClusterState(clusterAddress: string): Promise<ClusterState> {
        return _queryCluster<ClusterState>(
            clusterAddress,
            {
                cluster_state: {}
            }
        );
    }

    function getClusterInfo(clusterAddress: string): Promise<ClusterInfo> {
        return _queryCluster<ClusterInfo>(
            clusterAddress,
            {
                cluster_info: {}
            }
        );
    }

    function getTarget(clusterAddress: string): Promise<Target> {
        return _queryCluster<Target>(
            clusterAddress,
            {
                target: {}
            }
        );
    }

    return {
        getClusterList,
        getClusterState,
        getClusterInfo,
        getTarget
    };
};
  