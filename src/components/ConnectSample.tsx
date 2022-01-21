import { useWallet, WalletStatus } from '@terra-money/wallet-provider';
import React from 'react';

export function ConnectSample() {
  const {
    status,
    network,
    wallets,
    availableConnectTypes,
    availableInstallTypes,
    availableConnections,
    supportFeatures,
    connect,
    install,
    disconnect,
  } = useWallet();

  return (
    <div>
      <h1>Connect Wallet</h1>
        {status === WalletStatus.WALLET_NOT_CONNECTED && (
          <>
            {availableConnections.map(
              ({ type, name, icon, identifier = '' }) => (
                <button
                  key={'connection-' + type + identifier}
                  onClick={() => connect(type, identifier)}
                >
                  <img
                    src={icon}
                    alt={name}
                    style={{ width: '1em', height: '1em' }}
                  />
                  {name} [{identifier}]
                </button>
              ),
            )}
          </>
        )}
        {status === WalletStatus.WALLET_CONNECTED && (
          <button onClick={() => disconnect()}>Disconnect</button>
        )}
    </div>
  );
}
