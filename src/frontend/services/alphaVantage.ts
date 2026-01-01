const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
    symbol: string;
    open: string;
    high: string;
    low: string;
    price: string;
    volume: string;
    latestTradingDay: string;
    previousClose: string;
    change: string;
    changePercent: string;
}

export interface StockSearchResult {
    symbol: string;
    name: string;
    type: string;
    region: string;
    marketOpen: string;
    marketClose: string;
    timezone: string;
    currency: string;
    matchScore: string;
}
interface AlphaVantageSearchResponse {
    bestMatches?: Array<{
        '1. symbol': string;
        '2. name': string;
        '3. type': string;
        '4. region': string;
        '5. marketOpen': string;
        '6. marketClose': string;
        '7. timezone': string;
        '8. currency': string;
        '9. matchScore': string;
    }>;
    'Note'?: string;
    'Error Message'?: string;
}

interface AlphaVantageQuoteResponse {
    'Global Quote'?: {
        '01. symbol': string;
        '02. open': string;
        '03. high': string;
        '04. low': string;
        '05. price': string;
        '06. volume': string;
        '07. latest trading day': string;
        '08. previous close': string;
        '09. change': string;
        '10. change percent': string;
    };
    'Note'?: string;
    'Error Message'?: string;
}

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