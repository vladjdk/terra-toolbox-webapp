import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { useConnectedWallet, useWallet } from '@terra-money/wallet-provider';
import { useState } from 'react';

export function Wallet() {
  const {
    availableConnections,
    connect,
    disconnect,
  } = useWallet();
  const connectedWallet = useConnectedWallet();
  const [open, setOpen] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getButtonText = () => {
    return (connectedWallet) ? 
        `${connectedWallet.walletAddress.substring(0,6)}...${connectedWallet.walletAddress.substring(connectedWallet.walletAddress.length - 7, connectedWallet.walletAddress.length - 1)}`
        : 
        'Connect Wallet';
  }

  return (
    <div>
        <Chip label={getButtonText()} sx={{bgcolor: 'primary.light'}} onClick={handleClickOpen} />
        <Dialog
            open={open}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{"Connect Wallet"}</DialogTitle>
            <DialogContent>
                { connectedWallet ?
                    <>
                        <DialogContentText id="alert-dialog-slide-description">
                            Wallet Connected:
                        </DialogContentText>
                        <DialogContentText id="alert-dialog-slide-description">
                            {connectedWallet.terraAddress}
                        </DialogContentText>
                        <Stack spacing={2} direction="row" sx={{justifyContent: 'center'}}>
                            <Button variant="contained" onClick={() => disconnect()}>Disconnect</Button>
                        </Stack>
                    </>
                    :
                    <Stack spacing={2} direction="row" sx={{justifyContent: 'center'}}>
                        {availableConnections.map(
                            ({ type, name, icon, identifier = '' }) => (
                                <Button variant="contained" key={'connection-' + type + identifier} onClick={() => connect(type, identifier)}>
                                    <img
                                        src={icon}
                                        alt={name}
                                        style={{ width: '1em', height: '1em' }}
                                    />
                                    {name}
                                </Button>
                            ),
                        )}
                    </Stack>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    </div>
  );
}
