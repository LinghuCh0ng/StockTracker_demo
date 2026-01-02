import { useEffect, useRef, useState } from "react"
import { getStockQuote, searchStocks } from "../services/alphaVantage"
import type { StockQuote, StockSearchResult } from "../services/interface"

export default function Stock() {
    const [ symbol, setSymbol ] = useState('')
    const [ stockData, setStockData ] = useState<StockQuote | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchSuggestions, setSearchSuggestions] = useState<StockSearchResult[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup function - runs when component unmounts
    // Empty array = only run on mount/unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const handleSearch = async () => {
        // This function will:
        // 1. Clear previous errors
        // 2. Set loading to true
        // 3. Call the API
        // 4. Handle success/error
        // 5. Set loading to false
        setError(null)
        setStockData(null)

        // Check if symbol is empty
        if (!symbol.trim()) {
            setError('Please enter a stock symbol.')
            return
        }

        setLoading(true)

        try {
            const data = await getStockQuote(symbol.trim().toUpperCase())
            
            setStockData(data)
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Failed to fetch stock data')
            }
        } finally {
            // Always set loading to false when done
            setLoading(false)
        }
    }

    const handleInputChange = async (value: string) => {
        setSymbol(value)

        // Clear suggestions if input is empty
        if (!value.trim()) {
            setSearchSuggestions([])
            setShowSuggestions(false)
            return
        }

        //debounce
        //if searchTimeoutRef has previous timeout
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        // Wait 300ms after user stops typing
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const results = await searchStocks(value.trim())
                setSearchSuggestions(results)
                setShowSuggestions(true)
            } catch(err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError("Search fail")
                }

                setSearchSuggestions([])
                setShowSuggestions(false)
            }
        }, 300)
    }
    
    return (
        <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold">Stock Search</h1>
            
            {/* Search Section */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    {/* Input field */}
                    <input
                        type="text"
                        placeholder="Enter Stock symbol (e.g., AAPL)"
                        value={symbol}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch()
                        }}
                        onFocus={() => {
                            if (searchSuggestions.length > 0) {
                                setShowSuggestions(true)
                            }
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    />
                    {/* ropdown*/}
                    {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {searchSuggestions.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => {
                                        // Automatically search when clicked
                                        setSymbol(stock.symbol)
                                        setShowSuggestions(false)
                                        handleSearch()
                                    }}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                >
                                    <div className="font-semibold">{stock.symbol}</div>
                                    <div className="text-sm text-gray-600">{stock.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Button */}
                <button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Loading' : 'Search'}
                </button>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            {/* Loading Indicator */}
            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading stock data...</p>
                </div>
            )}
            {/* Stock Data Display */}
            {stockData && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
                    <h2 className="text-2xl font-bold mb-4">{stockData.symbol}</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Price</p>
                            <p className="text-2xl font-bold">${stockData.price}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Change</p>
                            <p className={`text-xl font-semibold ${parseFloat(stockData.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stockData.change} ({stockData.changePercent})
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Open</p>
                            <p className="text-lg">${stockData.open}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Previous Close</p>
                            <p className="text-lg">${stockData.previousClose}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">High</p>
                            <p className="text-lg">${stockData.high}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Low</p>
                            <p className="text-lg">${stockData.low}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Volume</p>
                            <p className="text-lg">{parseInt(stockData.volume).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Latest Trading Day</p>
                            <p className="text-lg">{stockData.latestTradingDay}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
)
}
