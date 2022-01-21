import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { Main } from "Main"
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom';
import './style.css'

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <BrowserRouter>
      <WalletProvider {...chainOptions}>
        <Main />
      </WalletProvider>
    </BrowserRouter>,
    document.getElementById('root'),
  );
});
