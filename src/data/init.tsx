import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useWallet } from "@terra-money/wallet-provider";
import useConnectGraph from "../hooks/useConnectGraph";
import useAddress from "../hooks/useAddress";
import { addressState } from "../data/wallet";
import { networkNameState } from "../data/network";

export const useInitAddress = () => {
  const address = useAddress();
  const setAddress = useSetRecoilState(addressState);
  useConnectGraph();

  useEffect(() => {
    setAddress(address || "");
  }, [address, setAddress]);
};

export const useInitNetwork = () => {
  const wallet = useWallet();
  const { name } = wallet.network;

  const setNetworkName = useSetRecoilState(networkNameState);
  useEffect(() => {
    setNetworkName(name);
  }, [name, setNetworkName]);
};
