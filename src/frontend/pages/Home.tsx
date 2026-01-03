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
                // Fetch currency rates
                const currencyResponse = await fetch(`${API_BASE_URL}/currency-rates`);
                
                if (!currencyResponse.ok) {
                    throw new Error(`Failed to fetch currency rates: ${currencyResponse.status} ${currencyResponse.statusText}`);
                }
                
                const contentType = currencyResponse.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
                }
                
                const currencyResult = await currencyResponse.json();
                
                if (currencyResult.success) {
                    setCurrencyData(currencyResult.data);
                } else {
                    throw new Error(currencyResult.error || 'Failed to fetch currency rates');
                }
                
                // Fetch commodity prices
                const commodityResponse = await fetch(`${API_BASE_URL}/commodity-prices`);
                
                if (!commodityResponse.ok) {
                    throw new Error(`Failed to fetch commodity prices: ${commodityResponse.status} ${commodityResponse.statusText}`);
                }
                
                const commodityContentType = commodityResponse.headers.get('content-type');
                if (!commodityContentType || !commodityContentType.includes('application/json')) {
                    throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
                }
                
                const commodityResult = await commodityResponse.json();
                
                if (commodityResult.success) {
                    setCommodityData(commodityResult.data);
                } else {
                    throw new Error(commodityResult.error || 'Failed to fetch commodity prices');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
                setError(errorMessage);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    return (
    <div className="space-y-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Market Overview</h1>
                        <p className="text-blue-100 text-lg">Real-time currency and commodity prices</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 mt-6">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-white">Live Data</span>
                    </div>
                    <div className="text-sm text-blue-100">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>

        {/* Currency Section */}
        <div>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-xl">💱</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Major Currency Pairs</h2>
            </div>
            {loading && currencyData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading currency data...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">⚠️</span>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {currencyData.map((currency) => {
                        const currencyInfo = MAIN_CURRENCIES.find(
                            c => c.from === currency.fromCurrency && c.to === currency.toCurrency
                        );
                        const rate = parseFloat(currency.exchangeRate);
                        
                        return (
                            <div 
                                key={`${currency.fromCurrency}-${currency.toCurrency}`}
                                className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {currencyInfo?.name || `${currency.fromCurrency}/${currency.toCurrency}`}
                                        </div>
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">💱</span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-700 mb-3">
                                        {currency.fromCurrency}/{currency.toCurrency}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-4">
                                        {rate.toFixed(4)}
                                    </div>
                                    <div className="space-y-1 pt-3 border-t border-gray-100">
                                        {currency.timeZone && (
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>🌐</span>
                                                <span>{currency.timeZone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span>📅</span>
                                            <span>{currency.date || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Commodities Section */}
        <div>
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-xl">⚡</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Popular Commodities</h2>
            </div>
            {loading && commodityData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading commodity data...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">⚠️</span>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-xl border border-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                    <div className="flex animate-scroll space-x-6">
                        {[...commodityData, ...commodityData].map((commodity, index) => {
                            const commodityInfo = POPULAR_COMMODITIES.find(c => c.symbol === commodity.symbol);
                            const change = parseFloat(commodity.change);
                            const isPositive = change >= 0;
                            
                            return (
                                <div 
                                    key={`${commodity.symbol}-${index}`}
                                    className="flex-shrink-0 w-64 bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="text-lg">⚡</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-gray-800">
                                                    {commodityInfo?.name || commodity.symbol}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {commodityInfo?.unit || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-3">
                                        ${parseFloat(commodity.price).toFixed(2)}
                                    </div>
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                                        isPositive 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                        <span>{isPositive ? '📈' : '📉'}</span>
                                        <span>{isPositive ? '+' : ''}{commodity.change} ({commodity.changePercent})</span>
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