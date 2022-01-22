import { AccAddress, Coins, MsgExecuteContract } from "@terra-money/terra.js";
import { useRecoilValue } from "recoil";
import { lcdClientQuery } from "../data/network";
import { addressState } from "../data/wallet";
// import { TxResult, useWallet } from "@terra-money/wallet-provider";
// import useFee from "./useFee";

    interface BalanceResponse {
        balance: string
    }

    interface TokenInfo {
        name: string,
        symbol: string,
        decimals: number,
        total_supply: string
    }
  
    export const useContract = (contractAddress: AccAddress) => {
        // const { post } = useWallet();
        // const fee = useFee();
        const userWalletAddr = useRecoilValue(addressState);
        const lcdClient = useRecoilValue(lcdClientQuery);
    
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

        function getBalance(): Promise<BalanceResponse> {
            return _query<BalanceResponse>({
                balance: {
                    address: userWalletAddr
                }
            })
        }

        function getTokenInfo(): Promise<TokenInfo> {
            return _query<TokenInfo>({
                token_info: {}
            })
        }

        // TODO: Add functionality for sending tokens to another wallet.
    
        return {
            getBalance,
            getTokenInfo
        };
    };
  