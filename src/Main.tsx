import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import React from 'react';
import ReactDOM from 'react-dom';
import './main.css';

export function Main() {
  return (
    <div className="main">
      <ConnectSample />
      <QuerySample />
    </div>
  );
}