type NetworkConfig = ExtNetworkConfig & LocalNetworkConfig;

interface Network extends NetworkConfig {
  /** Get finder link */
  finder: (address: string, path?: string) => string;
}

interface ExtNetworkConfig {
  name: string;
  chainID: string;
}

interface LocalNetworkConfig {
  /** Graphql server URL */
  mantle: string;
  stats: string;
  /** Contracts */
  shuttle: Record<ShuttleNetwork, string>;
  contracts: Record<ContractName, string>;
  /** Fixed fee */
  fee: { gasPrice: number; amount: number };
}
