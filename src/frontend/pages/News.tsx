import { useState, useEffect } from 'react';
import type { News, NewsEntity } from '../services/interface';

const API_BASE_URL = 'http://localhost:3001/api';

export default function News() {
    const [newsData, setNewsData] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterSymbols, setFilterSymbols] = useState<string>('');
    const [showHeadlines, setShowHeadlines] = useState(false);
    const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
    
    // Headline news state (for scrolling ticker)
    const [headlineNews, setHeadlineNews] = useState<News[]>([]);
    const [headlineLoading, setHeadlineLoading] = useState(true);

    // Fetch headline news only once when component mounts
    useEffect(() => {
        fetchHeadlineNews();
    }, []); // Empty dependency array - only runs once on mount

    useEffect(() => {
        fetchNews();
    }, [showHeadlines, filterSymbols, filterSentiment]);

    // Fetch headline news for scrolling ticker
    // This only runs once when the page loads, and checks if today's news exists
    const fetchHeadlineNews = async () => {
        setHeadlineLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/news?headlines=true`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch headline news: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }

            const result = await response.json();

            if (result.success) {
                setHeadlineNews(result.data || []);
            } else {
                console.warn('No headline news available:', result.error);
                setHeadlineNews([]);
            }
        } catch (err) {
            console.error('Error fetching headline news:', err);
            // Don't show error to user for headline news, just set empty array
            setHeadlineNews([]);
        } finally {
            setHeadlineLoading(false);
        }
    };

    const fetchNews = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = `${API_BASE_URL}/news`;
            const params = new URLSearchParams();

            if (showHeadlines) {
                params.append('headlines', 'true');
            } else {
                if (filterSymbols.trim()) {
                    params.append('symbols', filterSymbols.trim());
                }
                if (filterSentiment === 'positive') {
                    params.append('sentiment_gte', '0.1');
                } else if (filterSentiment === 'negative') {
                    params.append('sentiment_lte', '-0.1');
                } else if (filterSentiment === 'neutral') {
                    params.append('sentiment_gte', '0');
                    params.append('sentiment_lte', '0');
                }
                params.append('limit', '50');
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response. Please check if the backend server is running.');
            }

            const result = await response.json();

            if (result.success) {
                setNewsData(result.data || []);
            } else {
                throw new Error(result.error || 'Failed to fetch news');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load news';
            setError(errorMessage);
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getSentimentColor = (score: number) => {
        if (score > 0.1) return 'text-green-600 bg-green-50 border-green-200';
        if (score < -0.1) return 'text-red-600 bg-red-50 border-red-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getSentimentLabel = (score: number) => {
        if (score > 0.1) return 'Positive';
        if (score < -0.1) return 'Negative';
        return 'Neutral';
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 md:p-12 shadow-2xl">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📰</span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Financial News</h1>
                            <p className="text-purple-100 text-lg">Stay updated with the latest market news and insights</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrolling Headline News Ticker */}
            {headlineNews.length > 0 && (
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-xl">🔥</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Today's Headlines</h2>
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl p-4 shadow-xl border-2 border-yellow-200">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                        <div 
                            className="flex space-x-6 hover:pause-animation"
                            style={{
                                animation: `scroll ${Math.max(30, headlineNews.length * 8)}s linear infinite`
                            }}
                        >
                            {/* Duplicate the array for seamless scrolling */}
                            {[...headlineNews, ...headlineNews].map((article, index) => (
                                <div
                                    key={`${article.uuid}-${index}`}
                                    className="flex-shrink-0 flex items-center space-x-4 bg-white rounded-lg px-6 py-3 border border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300 group"
                                >
                                    {/* Breaking News Badge */}
                                    <div className="flex-shrink-0">
                                        <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                                            Breaking
                                        </span>
                                    </div>
                                    
                                    {/* News Title */}
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-0 group-hover:text-orange-600 transition-colors"
                                    >
                                        <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                                            {article.title}
                                        </span>
                                    </a>
                                    
                                    {/* Entities (if available) */}
                                    {article.entities && article.entities.length > 0 && (
                                        <div className="flex-shrink-0 flex items-center space-x-2">
                                            {article.entities.slice(0, 3).map((entity, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200"
                                                >
                                                    {entity.symbol || entity.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Time */}
                                    <div className="flex-shrink-0 text-xs text-gray-500">
                                        {formatDate(article.published_at).split(',')[0]}
                                    </div>
                                    
                                    {/* Arrow */}
                                    <div className="flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors">
                                        →
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Symbol Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Stock Symbols
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., AAPL, TSLA, MSFT (comma-separated)"
                            value={filterSymbols}
                            onChange={(e) => setFilterSymbols(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={showHeadlines}
                        />
                    </div>

                    {/* Sentiment Filter */}
                    <div className="md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sentiment
                        </label>
                        <select
                            value={filterSentiment}
                            onChange={(e) => setFilterSentiment(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={showHeadlines}
                        >
                            <option value="all">All</option>
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                        </select>
                    </div>

                    {/* Headlines Toggle */}
                    <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showHeadlines}
                                onChange={(e) => {
                                    setShowHeadlines(e.target.checked);
                                    if (e.target.checked) {
                                        setFilterSymbols('');
                                        setFilterSentiment('all');
                                    }
                                }}
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Headlines Only</span>
                        </label>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex items-end">
                        <button
                            onClick={fetchNews}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {/* News List */}
            {loading && newsData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading news...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">⚠️</span>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            ) : newsData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-600 font-medium">No news articles found</p>
                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {showHeadlines ? 'Headline News' : 'Latest News'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {newsData.length} {newsData.length === 1 ? 'article' : 'articles'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {newsData.map((article) => (
                            <article
                                key={article.uuid}
                                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-300 overflow-hidden"
                            >
                                {/* Image */}
                                {article.image_url && (
                                    <div className="relative h-48 overflow-hidden bg-gray-200">
                                        <img
                                            src={article.image_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            {article.title}
                                        </a>
                                    </h3>

                                    {/* Description/Snippet */}
                                    {(article.description || article.snippet) && (
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {article.description || article.snippet}
                                        </p>
                                    )}

                                    {/* Entities */}
                                    {article.entities && article.entities.length > 0 && (
                                        <div className="mb-4 space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {article.entities.slice(0, 5).map((entity, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-sm"
                                                    >
                                                        <span className="font-semibold text-gray-700">
                                                            {entity.symbol || entity.name}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSentimentColor(entity.sentiment_score)}`}>
                                                            {getSentimentLabel(entity.sentiment_score)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {entity.sentiment_score > 0 ? '+' : ''}
                                                            {entity.sentiment_score.toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {article.entities.length > 5 && (
                                                    <span className="text-xs text-gray-500 self-center">
                                                        +{article.entities.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Categories */}
                                    {article.categories && article.categories.length > 0 && (
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {article.categories.map((category, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded border border-purple-200"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center space-x-1">
                                                <span>📅</span>
                                                <span>{formatDate(article.published_at)}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <span>📰</span>
                                                <span className="truncate max-w-[150px]">{article.source}</span>
                                            </span>
                                        </div>
                                        <a
                                            href={article.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 group-hover:underline"
                                        >
                                            <span>Read more</span>
                                            <span>→</span>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
