import { useState, useEffect } from 'react'
import type { CurrencyRate, StockQuote } from '../services/interface'

const API_BASE_URL = 'http://localhost:3001/api';

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

export default function Home() {
    const [currencyData, setCurrencyData] = useState<CurrencyRate[]>([]);
    const [commodityData, setCommodityData] = useState<StockQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const currencyResponse = await fetch(`${API_BASE_URL}/currency-rates`);
                const currencyResult = await currencyResponse.json();
                
                if (currencyResult.success) {
                    setCurrencyData(currencyResult.data);
                } else {
                    throw new Error(currencyResult.error || 'Failed to fetch currency rates');
                }
                
                const commodityResponse = await fetch(`${API_BASE_URL}/commodity-prices`);
                const commodityResult = await commodityResponse.json();
                
                if (commodityResult.success) {
                    setCommodityData(commodityResult.data);
                } else {
                    throw new Error(commodityResult.error || 'Failed to fetch commodity prices');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    return (
    <div className="space-y-8">
        {/* Title */}
        <div>
            <h1 className="text-3xl font-bold mb-2">Market Overview</h1>
            <p className="text-gray-600">Real-time currency and commodity prices</p>
        </div>

        {/* Market Section */}
        <div>
            <h2 className="text-2xl font-bold mb-4">Major Currency Pairs</h2>
            {loading && currencyData.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading currency data...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currencyData.map((currency) => {
                        const currencyInfo = MAIN_CURRENCIES.find(
                            c => c.from === currency.fromCurrency && c.to === currency.toCurrency
                        );
                        const rate = parseFloat(currency.exchangeRate);
                        
                        return (
                            <div 
                                key={`${currency.fromCurrency}-${currency.toCurrency}`}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="text-sm text-gray-600 mb-1">
                                    {currencyInfo?.name || `${currency.fromCurrency}/${currency.toCurrency}`}
                                </div>
                                <div className="text-lg font-semibold mb-2">
                                    {currency.fromCurrency}/{currency.toCurrency}
                                </div>
                                <div className="text-2xl font-bold mb-2">
                                    {rate.toFixed(4)}
                                </div>
                                {currency.timeZone && (
                                    <div className="text-xs text-gray-500">
                                        Timezone: {currency.timeZone}
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Date: {currency.date || 'N/A'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        <div>
            <h2 className="text-2xl font-bold mb-4">Popular Commodities</h2>
            {loading && commodityData.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading commodity data...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            ) : (
                <div className="relative overflow-hidden bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex animate-scroll space-x-6">
                        {[...commodityData, ...commodityData].map((commodity, index) => {
                            const commodityInfo = POPULAR_COMMODITIES.find(c => c.symbol === commodity.symbol);
                            const change = parseFloat(commodity.change);
                            const isPositive = change >= 0;
                            
                            return (
                                <div 
                                    key={`${commodity.symbol}-${index}`}
                                    className="flex-shrink-0 w-56 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold text-lg">
                                            {commodityInfo?.name || commodity.symbol}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {commodityInfo?.unit || ''}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold mb-2">
                                        ${parseFloat(commodity.price).toFixed(2)}
                                    </div>
                                    <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? '+' : ''}{commodity.change} ({commodity.changePercent})
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>
);
}