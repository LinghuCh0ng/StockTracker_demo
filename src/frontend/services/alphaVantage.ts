import type { 
    AlphaVantageQuoteResponse, 
    StockQuote, 
    AlphaVantageSearchResponse, 
    StockSearchResult,
    CurrencyRate,
    AlphaVantageCurrencyResponse,
} from "./interface";

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export async function getStockQuote(symbol: string): Promise<StockQuote> {
    // Function body
    if (!API_KEY) {
        throw new Error('Alpha Vantage API key is not configured...');
    }
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    const data: AlphaVantageQuoteResponse = await response.json();
    if (data['Note']) {
        throw new Error('API call frequency limit exceeded...');
    }
    if (data['Error Message']) {
        throw new Error(data['Error Message']);
    }
    // data existence checking
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

export async function searchStocks(keywords: string): Promise<StockSearchResult[]> {
    // Similar structure to getStockQuote:
    // 1. Check API key
    // 2. Build URL with function=SYMBOL_SEARCH
    // 3. Fetch data
    // 4. Handle errors
    // 5. Transform and return
    if (!API_KEY) throw new Error('Alpha Vantage API key is not configured...');

    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    
    const data: AlphaVantageSearchResponse = await response.json();

    if (data['Note']) throw new Error('API call frequency limit exceeded...');

    if (data['Error Message']) throw new Error(data['Error Message']);

    if (!data['bestMatches']) throw new Error('No match');

    const result: StockSearchResult[] = data.bestMatches.map(d => {
        return {
            symbol: d["1. symbol"],
            name: d["2. name"],
            type: d['3. type'],
            region: d["4. region"],
            marketOpen: d["5. marketOpen"],
            marketClose: d["6. marketClose"],
            timezone: d["7. timezone"],
            currency: d["8. currency"],
            matchScore: d["9. matchScore"]
        }
    });

    return result;
}

/**
 * Get currency exchange rate
 * @param fromCurrency Base currency code, e.g., 'USD'
 * @param toCurrency Target currency code, e.g., 'CNY'
 * @returns Promise with currency rate data
 */
export async function getCurrencyRate(fromCurrency: string, toCurrency: string): Promise<CurrencyRate> {
    if (!API_KEY) throw new Error('Alpha Vantage API key is not configured...');
    
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    
    const response = await fetch(url);

    if(!response.ok) throw new Error(`API request failed: ${response.status}`);

    const data: AlphaVantageCurrencyResponse = await response.json();

    if(data['Note']) throw new Error('API call frequency limit exceeded...');

    if(data['Error Message']) throw new Error(data['Error Message']);

    if(!data['Realtime Currency Exchange Rate']) throw new Error(`Currency rate not found for ${fromCurrency}/${toCurrency}`);

    const result = data['Realtime Currency Exchange Rate'];

    return {
        fromCurrency: result['1. From_Currency Code'],
        toCurrency: result['3. To_Currency Code'],
        exchangeRate: result['5. Exchange Rate'],
        bidPrice: result['8. Bid Price'],
        askPrice: result['9. Ask Price'],
        lastRefreshed: result['6. Last Refreshed'],
        timeZone: result['7. Time Zone'],
    }
}
