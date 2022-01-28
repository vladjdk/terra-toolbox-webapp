import axios from 'axios';

const API_URL = 'https://api.alphadefi.fund';
const WEBSITE_URL = 'https://app.alphadefi.fund/dashboard';

export interface LiquidationByPrice {
    Date: string
    Loan_Value: number
    Luna_Liquidation_Price: number
    areatowatch: number
    bigrisk: number
    collateral_value: number
    ltv: number
    luna_price: number
    percent_of_loans: number
}

export const useAlphaDeFi = () => {
    function getLiquidationsByPrice(): Promise<LiquidationByPrice[]> {
        return axios.get(`${API_URL}/info/liqprofile`).then(response => {
            return response.data;
        })
    }

    function navigateToSite() {
        window.open(WEBSITE_URL, '_blank');
    }

    return {
        getLiquidationsByPrice,
        navigateToSite
    };
};
  