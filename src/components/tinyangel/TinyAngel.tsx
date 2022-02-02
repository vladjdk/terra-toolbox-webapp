import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { TransactionDialog } from "components/dialogs/TransactionDialog"
import useNetwork from "hooks/useNetwork"
import { useEffect, useState } from "react"
import { useLCDClient } from "@terra-money/wallet-provider";
import useAddress from "hooks/useAddress";
import { tinyThreshold } from "./tinyThreshold";
import { donateTinyBalances } from "./msgs";
import { ANGEL_PROTO_ADDRESS_BOMBAY } from "../../constants";

const tempStyle = {
    display: 'grid',
    placeItems: 'center',
    height: 'calc(100vh - 65px)'
}

const TinyAngel = (): JSX.Element => {

    const [tinyBalances, setTinyBalances] = useState<any[]>([])
    const [msgs, setMsgs] = useState<MsgSend[] | MsgExecuteContract[]>([])
    const LCD = useLCDClient()
    const user_address = useAddress()

    const onDonate = async () => {
        if ( tinyBalances.length === 0 ) {
            alert("You don't have any tiny balances to donate")
            return;
        }

        const balancesObj = tinyBalances.reduce((obj, el) => {
            return Object.assign(obj, { [el.denom]: el.amount })
        }, {})

        const msgs = donateTinyBalances(user_address, ANGEL_PROTO_ADDRESS_BOMBAY, balancesObj)
        setMsgs(msgs);
    }

    useEffect(() => {
        if ( !user_address ) return;

        ;(async () => {
            const [coins] = await LCD.bank.balance(user_address);
            const _coins = coins.toData().filter(e => Number( e.amount ) < tinyThreshold);
            setTinyBalances(_coins);
        })();
    }, []);

    return (
        <section style={tempStyle}>
            <button onClick={onDonate}>
                Donate Tiny Balances
            </button>
            { Boolean(msgs.length) && 
                <TransactionDialog title="Donate to Angel" msgs={msgs} onSuccess={() => null} onClose={() => setMsgs([])}/>
            }
        </section>
    )
}

export default TinyAngel