import { useWallet } from "@terra-money/wallet-provider";
import networks from "../networks";

const useNetwork = () => {
  const { network: extNetwork } = useWallet();
  return networks[extNetwork.name];
};

export default useNetwork;
