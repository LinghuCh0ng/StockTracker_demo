import dotenv from 'dotenv';
import type { 
    CurrencyRate, 
    StockQuote, 
    AlphaVantageCurrencyResponse, 
    AlphaVantageQuoteResponse 
} from '../../frontend/services/interface';

dotenv.config();

const API_KEY = process.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch currency rate from Alpha Vantage API
 * @param fromCurrency Base currency code, e.g., 'USD'
 * @param toCurrency Target currency code, e.g., 'CNY'
 * @returns Promise with currency rate data
 */
export async function fetchCurrencyRateFromAPI(
    fromCurrency: string, 
    toCurrency: string
): Promise<CurrencyRate> {
    if (!API_KEY) {
        throw new Error('Alpha Vantage API key is not configured');
    }
    
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data: AlphaVantageCurrencyResponse = await response.json();
    
    if (data['Note']) {
        throw new Error('API call frequency limit exceeded');
    }
    
    if (data['Error Message']) {
        throw new Error(data['Error Message']);
    }
    
    if (!data['Realtime Currency Exchange Rate']) {
        throw new Error(`Currency rate not found for ${fromCurrency}/${toCurrency}`);
    }
    
    const rate = data['Realtime Currency Exchange Rate'];
    
    return {
        timeZone: rate['7. Time Zone'],
        fromCurrency: rate['1. From_Currency Code'],
        toCurrency: rate['3. To_Currency Code'],
        exchangeRate: rate['5. Exchange Rate'],
        bidPrice: rate['8. Bid Price'],
        askPrice: rate['9. Ask Price'],
        lastRefreshed: rate['6. Last Refreshed'],
    };
}

/**
 * Fetch stock quote from Alpha Vantage API
 * @param symbol Stock symbol, e.g., 'AAPL', 'GLD'
 * @returns Promise with stock quote data
 */
export async function fetchStockQuoteFromAPI(symbol: string): Promise<StockQuote> {
    if (!API_KEY) {
        throw new Error('Alpha Vantage API key is not configured');
    }
    
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    
    const data: AlphaVantageQuoteResponse = await response.json();
    
    if (data['Note']) {
        throw new Error('API call frequency limit exceeded');
    }
    
    if (data['Error Message']) {
        throw new Error(data['Error Message']);
    }
    
    if (!data['Global Quote'] || !data['Global Quote']['01. symbol']) {
        throw new Error(`Stock symbol "${symbol}" not found`);
    }
    
    const quote = data['Global Quote'];
    
    return {
        symbol: quote['01. symbol'],
        open: quote['02. open'],
        high: quote['03. high'],
        low: quote['04. low'],
        price: quote['05. price'],
        volume: quote['06. volume'],
        latestTradingDay: quote['07. latest trading day'],
        previousClose: quote['08. previous close'],
        change: quote['09. change'],
        changePercent: quote['10. change percent'],
    };
}