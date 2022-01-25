import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Fee, MsgExecuteContract, TxInfo } from '@terra-money/terra.js';
import { TxResult, useConnectedWallet, useLCDClient } from '@terra-money/wallet-provider';
import { useEffect, useState } from 'react';

interface TransactionDialogProps {
    msgs: MsgExecuteContract[],
    fee?: Fee,
    title?: string,
    pollingMsg?: string,
    successMsg?: string,
    failureMsg?: string,
    onClose: () => void
}

enum TransactionState {
    signing, noSign, polling, success, fail, timeout
}

const MAX_POLLING_DURATION = 60 * 1000; // 1 minute
const POLLING_INTERVAL = 3 * 1000; // 3 seconds

export function TransactionDialog(props: TransactionDialogProps) {
    const lcdClient = useLCDClient();
    const wallet = useConnectedWallet();
    const [transactionState, setTransactionState] = useState<TransactionState>(TransactionState.signing);
    const [link, setLink] = useState<string>();

    const {
        msgs,
        fee = undefined,
        title = 'Waiting for Transaction',
        pollingMsg = 'Please wait...',
        successMsg = <p>Transaction successful!: <a href={link} target="_blank">[TX Info]</a></p>,
        failureMsg = 'Transaction failure!',
        onClose
    } = props;

    useEffect(() => {
        if (wallet) {
            wallet.post({
                msgs: msgs
            }).then((txResult: TxResult) => {
                setTransactionState(TransactionState.polling);
                pollTransaction(txResult.result.txhash, MAX_POLLING_DURATION, POLLING_INTERVAL).then(txInfo => {
                    if (txInfo) {
                        if (txInfo.code === 0) {
                            setTransactionState(TransactionState.success);
                            setLink(`https://finder.terra.money/${wallet?.network.chainID}/tx/${txInfo.txhash}`)
                        } else {
                            setTransactionState(TransactionState.fail);
                        }
                    } else {
                        setTransactionState(TransactionState.timeout);
                    }
                })
            }).catch((err) => {
                console.log(err)
                setTransactionState(TransactionState.noSign);
            })
        }
    }, [])

    async function pollTransaction(txhash: string, timeout = 30000, interval = 3000): Promise<TxInfo | undefined> {
        const start = Date.now();
        while(Date.now() - start < timeout) {
            try {
                return await lcdClient.tx.txInfo(txhash);
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        return undefined;
    }

    const canClose = () => {
        return [TransactionState.success, TransactionState.fail, TransactionState.noSign].includes(transactionState);
    }

    const onDialogClose = () => {
        if (canClose()) {
            onClose();
        }
    }

    const renderSigning = () => {
        return (
            <DialogContentText>
                Awaiting signature...
            </DialogContentText>
        )
    }

    const renderNoSign = () => {
        return (
            <DialogContentText>
                <b>FAILURE:</b> Client refused to sign.
            </DialogContentText>
        )
    }

    const renderPolling = () => {
        return (
            <DialogContentText>
                {pollingMsg}
            </DialogContentText>
        )
    }

    const renderSuccess = () => {
        // TODO: Add link to tx
        return (
            <DialogContentText>
                <b>SUCCESS:</b> {successMsg}
            </DialogContentText>
        )
    }

    const renderFail = () => {
        // TODO: Add error from tx
        return (
            <DialogContentText>
                <b>FAILURE:</b> {failureMsg}
            </DialogContentText>
        )
    }

    const renderTimeout = () => {
        return (
            <DialogContentText>
                <b>FAILURE:</b> Transaction Timeout
            </DialogContentText>
        )
    }

    const render = () => {
        switch(transactionState) { 
            case TransactionState.signing: { 
               return renderSigning(); 
            }
            case TransactionState.noSign: { 
                return renderNoSign();
            } 
            case TransactionState.success: { 
               return renderSuccess();
            }
            case TransactionState.fail: { 
                return renderFail();
            }
            case TransactionState.timeout: {
                return renderTimeout();
            }
            default: { 
                return renderPolling();
            }
        }
    }

    return (
        <Dialog open={true} onClose={onDialogClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {render()}
            </DialogContent>
            {canClose() && 
                <DialogActions>
                    <Button onClick={onDialogClose}>Close</Button>
                </DialogActions>
            }
        </Dialog>
    );
}
