import { getChainOptions, WalletProvider } from "@terra-money/wallet-provider";
import { RecoilRoot } from "recoil";
import { ConnectSample } from "components/ConnectSample";
import { QuerySample } from "components/QuerySample";
import { useInitAddress, useInitNetwork } from "data/init";
import React from "react";
import ReactDOM from "react-dom";
import "./main.css";

const RecoilInit = () => {
  useInitAddress();
  useInitNetwork();
  return <></>;
};

export function Main() {
  return (
    <RecoilRoot>
      <RecoilInit />
      <div className="main">
        <ConnectSample />
        <QuerySample />
      </div>
    </RecoilRoot>
  );
}
