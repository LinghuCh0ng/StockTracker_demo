/**
 * Interface definitions file
 * All interfaces and type definitions organized by functionality
 */

// ==================== Stock Related Interfaces ====================

/**
 * Stock quote data
 */
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

/**
 * Stock search result
 */
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

// ==================== Currency Related Interfaces ====================

/**
 * Currency exchange rate data
 */
export interface CurrencyRate {
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: string;
    bidPrice: string;
    askPrice: string;
    timeZone: string;
    lastRefreshed: string;
    date ?: string;
}

/**
 * Currency pair information (for UI display)
 */
export interface CurrencyPair {
    from: string;
    to: string;
    name: string;
}

// ==================== Commodity Related Interfaces ====================

/**
 * Commodity price data
 */
export interface CommodityPrice {
    symbol: string;
    name: string;
    price: string;
    change: string;
    changePercent: string;
    unit: string; // Unit, e.g., 'USD/oz' (gold), 'USD/barrel' (crude oil)
}

/**
 * Commodity information (for UI display)
 */
export interface CommodityInfo {
    symbol: string;
    name: string;
    unit: string;
}

// ==================== Alpha Vantage API Response Interfaces ====================

/**
 * Alpha Vantage stock quote response
 */
export interface AlphaVantageQuoteResponse {
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

/**
 * Alpha Vantage stock search response
 */
export interface AlphaVantageSearchResponse {
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

/**
 * Alpha Vantage currency exchange rate response
 */
export interface AlphaVantageCurrencyResponse {
    'Realtime Currency Exchange Rate'?: {
        '1. From_Currency Code': string;
        '2. From_Currency Name': string;
        '3. To_Currency Code': string;
        '4. To_Currency Name': string;
        '5. Exchange Rate': string;
        '6. Last Refreshed': string;
        '7. Time Zone': string;
        '8. Bid Price': string;
        '9. Ask Price': string;
    };
    'Note'?: string;
    'Error Message'?: string;
}

// ==================== MarketauxNews Response Interfaces ====================

/**
 * Entity highlight information
 */
export interface EntityHighlight {
    highlight: string;
    sentiment: number;
    highlighted_in: string;
}

/**
 * Entity information identified in news articles
 */
export interface NewsEntity {
    symbol: string;
    name: string;
    exchange: string;
    exchange_long: string;
    country: string;
    type: string;
    industry: string;
    match_score: number;
    sentiment_score: number;
    highlights: EntityHighlight[];
}

/**
 * Similar news article reference
 */
export interface SimilarNews {
    uuid: string;
    title: string;
    published_at: string;
    source: string;
}

/**
 * Individual news article from Marketaux API
 */
export interface MarketauxNewsArticle {
    uuid: string;
    title: string;
    description: string;
    snippet: string;
    url: string;
    image_url: string;
    language: string;
    published_at: string;
    source: string;
    categories?: string[];
    entities?: NewsEntity[];
    similar?: SimilarNews[];
}

/**
 * Meta information for Marketaux API response
 */
export interface MarketauxNewsMeta {
    found: number;
    returned: number;
    limit: number;
    page: number;
}

/**
 * Complete Marketaux API response structure
 */
export interface MarketauxNewsResponse {
    meta?: MarketauxNewsMeta;
    data?: MarketauxNewsArticle[];
    error?: {
        code: string;
        message: string;
    };
}

// ==================== News Related Interfaces ====================

/**
 * News article for frontend display
 */
export interface News {
    uuid: string;
    title: string;
    description: string;
    snippet: string;
    url: string;
    image_url: string;
    language: string;
    published_at: string;
    source: string;
    categories?: string[];
    entities?: NewsEntity[];
}

// ==================== Common Interfaces ====================

/**
 * API error response (common)
 */
export interface ApiErrorResponse {
    'Note'?: string;
    'Error Message'?: string;
}