import { getCurrencyRatesByDate, saveCurrencyRate } from '../models/CurrencyRate';
import { getCommodityPricesByDate, saveCommodityPrice } from '../models/CommodityPrice';
import { fetchCurrencyRateFromAPI, fetchStockQuoteFromAPI } from './alphaVantageService';

//4 main currency pairs
const MAIN_CURRENCIES = [
    { from: 'USD', to: 'CNY', name: 'USD/CNY' },
    { from: 'EUR', to: 'USD', name: 'EUR/USD' },
    { from: 'GBP', to: 'USD', name: 'GBP/USD' },
    { from: 'USD', to: 'JPY', name: 'USD/JPY' }
]

// Popular commodities (using ETF symbols)
const POPULAR_COMMODITIES = [
    { symbol: 'GLD', name: 'Gold', unit: 'USD/oz' },
    { symbol: 'SLV', name: 'Silver', unit: 'USD/oz' },
    { symbol: 'USO', name: 'Crude Oil', unit: 'USD/barrel' },
    { symbol: 'CPER', name: 'Copper', unit: 'USD/lb' },
    { symbol: 'CORN', name: 'Corn', unit: 'USD/bushel' },
    { symbol: 'WEAT', name: 'Wheat', unit: 'USD/bushel' },
    { symbol: 'SOYB', name: 'Soybean', unit: 'USD/bushel' },
    { symbol: 'NIB', name: 'Cocoa', unit: 'USD/metric ton' }
]

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if currency rates exist for today, if not, fetch from API
 * This is the main function called by the API route
 */
export async function checkAndGetCurrencyRates() {
    const today = getTodayDate();
    
    // Step 1: Check if data exists in database for today
    let data = await getCurrencyRatesByDate(today);
    
    // Step 2: If no data for today, fetch from API and save
    if (data.length === 0) {
        console.log(`No currency data for ${today}, fetching from API...`);
        data = await fetchAndSaveCurrencyRates(today);
    } else {
        console.log(`Using cached currency data for ${today}`);
    }
    
    return data;
}

/**
 * Check if commodity prices exist for today, if not, fetch from API
 * This is the main function called by the API route
 */
export async function checkAndGetCommodityPrices() {
    const today = getTodayDate();
    
    // Step 1: Check if data exists in database for today
    let data = await getCommodityPricesByDate(today);
    
    // Step 2: If no data for today, fetch from API and save
    if (data.length === 0) {
        console.log(`No commodity data for ${today}, fetching from API...`);
        data = await fetchAndSaveCommodityPrices(today);
    } else {
        console.log(`Using cached commodity data for ${today}`);
    }
    
    return data;
}

/**
 * Fetch currency rates from API and save to database
 * This function is called when today's data doesn't exist
 */
async function fetchAndSaveCurrencyRates(date: string) {
    const results = [];
    
    for (const currency of MAIN_CURRENCIES) {
        try {
            // Step 1: Fetch from API
            const rate = await fetchCurrencyRateFromAPI(currency.from, currency.to);
            
            // Step 2: Save to database
            await saveCurrencyRate({
                fromCurrency: currency.from,
                toCurrency: currency.to,
                exchangeRate: parseFloat(rate.exchangeRate),
                bidPrice: parseFloat(rate.bidPrice),
                askPrice: parseFloat(rate.askPrice),
                timeZone: rate.timeZone,
                date: date
            });
            
            // Step 3: Add to results array
            results.push({
                fromCurrency: currency.from,
                toCurrency: currency.to,
                exchangeRate: parseFloat(rate.exchangeRate),
                bidPrice: parseFloat(rate.bidPrice),
                askPrice: parseFloat(rate.askPrice),
                timeZone: rate.timeZone,
                date: date
            });
            
            // Step 4: Wait 12 seconds to avoid API limit (5 calls/minute)
            if (currency !== MAIN_CURRENCIES[MAIN_CURRENCIES.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        } catch (error) {
            console.error(`Failed to fetch ${currency.name}:`, error);
        }
    }
    
    return results;
}

/**
 * Fetch commodity prices from API and save to database
 * This function is called when today's data doesn't exist
 */
async function fetchAndSaveCommodityPrices(date: string) {
    const results = [];
    
    for (const commodity of POPULAR_COMMODITIES) {
        try {
            // Step 1: Fetch from API
            const quote = await fetchStockQuoteFromAPI(commodity.symbol);
            
            // Step 2: Save to database
            await saveCommodityPrice({
                symbol: commodity.symbol,
                name: commodity.name,
                price: quote.price,
                openPrice: quote.open,
                highPrice: quote.high,
                lowPrice: quote.low,
                previousClose: quote.previousClose,
                changeAmount: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume,
                unit: commodity.unit,
                date: date
            });
            
            // Step 3: Add to results array (format for frontend)
            results.push({
                symbol: commodity.symbol,
                name: commodity.name,
                price: quote.price,
                open: quote.open,
                high: quote.high,
                low: quote.low,
                previousClose: quote.previousClose,
                change: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume,
                unit: commodity.unit,
                date: date
            });
            
            // Step 4: Wait 12 seconds to avoid API limit
            if (commodity !== POPULAR_COMMODITIES[POPULAR_COMMODITIES.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        } catch (error) {
            console.error(`Failed to fetch ${commodity.name}:`, error);
        }
    }
    
    return results;
}