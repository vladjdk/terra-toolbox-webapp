import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Main } from "Main"
import React from 'react';
import ReactDOM from 'react-dom';
import './style.css'

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <Main />
    </WalletProvider>,
    document.getElementById('root'),
  );
});
