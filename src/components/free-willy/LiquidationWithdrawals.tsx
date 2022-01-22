import { QuerySample } from 'components/free-willy/QuerySample';
import LiquidationBidChart from 'components/free-willy/LiquidationBidChart';
import 'components/free-willy/liquidation-withdrawals.css';

export function LiquidationWithdrawals() {
    return (
        <div id="liquidation-withdrawals">
            <LiquidationBidChart/>
            <QuerySample />
        </div>
    );
  }
