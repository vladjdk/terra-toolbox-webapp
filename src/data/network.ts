import { LCDClient } from "@terra-money/terra.js";
import { atom, selector } from "recoil";
import networks, { defaultNetwork } from "../networks";

export const networkNameState = atom({
  key: "networkName",
  default: defaultNetwork.name,
});

export const networkQuery = selector({
  key: "network",
  get: ({ get }) => {
    const name = get(networkNameState);
    return networks[name];
  },
});

export const mantleURLQuery = selector({
  key: "mantleURL",
  get: ({ get }) => {
    const { mantle } = get(networkQuery);
    return mantle;
  },
});

export const statsURLQuery = selector({
  key: "statsURL",
  get: ({ get }) => {
    const { stats } = get(networkQuery);
    return stats;
  },
});

export const lcdClientQuery = selector({
  key: "LcdClient",
  get: ({ get }) => {
    const network = get(networkQuery);
    return new LCDClient({ URL: network.lcd, chainID: network.chainID });
  },
});
