import dotenv from 'dotenv';
import type { 
    MarketauxNewsResponse,
    MarketauxNewsArticle
} from '../../frontend/services/interface';

dotenv.config();

const API_KEY = process.env.VITE_MARKETAUX_API_KEY;
const BASE_URL = 'https://api.marketaux.com/v1';

/**
 * Parameters for fetching news from Marketaux API
 */
export interface MarketauxNewsParams {
    symbols?: string;           // Comma-separated symbols, e.g., "AAPL,TSLA"
    limit?: number;             // Number of results (default: 50, max: 100)
    page?: number;              // Page number (default: 1)
    language?: string;          // Language code (default: "en")
    sentiment_gte?: number;     // Sentiment score greater than or equal to
    sentiment_lte?: number;     // Sentiment score less than or equal to
    countries?: string;         // Comma-separated country codes
    entity_types?: string;      // Comma-separated entity types
    industries?: string;        // Comma-separated industries
    filter_entities?: boolean;  // Filter entities to match query
    must_have_entities?: boolean; // Only return articles with entities
}

/**
 * Fetch news from Marketaux API
 * @param params Optional parameters for filtering news
 * @returns Promise with Marketaux API response
 */
export async function fetchNewsFromAPI(
    params: MarketauxNewsParams = {}
): Promise<MarketauxNewsResponse> {
    if (!API_KEY) {
        throw new Error('Marketaux API key is not configured');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
        api_token: API_KEY,
        ...(params.symbols && { symbols: params.symbols }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.page && { page: params.page.toString() }),
        ...(params.language && { language: params.language }),
        ...(params.sentiment_gte !== undefined && { sentiment_gte: params.sentiment_gte.toString() }),
        ...(params.sentiment_lte !== undefined && { sentiment_lte: params.sentiment_lte.toString() }),
        ...(params.countries && { countries: params.countries }),
        ...(params.entity_types && { entity_types: params.entity_types }),
        ...(params.industries && { industries: params.industries }),
        ...(params.filter_entities !== undefined && { filter_entities: params.filter_entities.toString() }),
        ...(params.must_have_entities !== undefined && { must_have_entities: params.must_have_entities.toString() }),
    });
    
    const url = `${BASE_URL}/news/all?${queryParams.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
            throw new Error('Invalid API token');
        } else if (response.status === 402) {
            throw new Error('Usage limit reached');
        } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
            throw new Error('Access to this endpoint is restricted on your plan');
        } else if (response.status === 404) {
            throw new Error('API endpoint not found');
        } else if (response.status === 500) {
            throw new Error('Marketaux API server error');
        } else if (response.status === 503) {
            throw new Error('Marketaux API is under maintenance');
        } else {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
    }
    
    const data: MarketauxNewsResponse = await response.json();
    
    // Check for API error response
    if (data.error) {
        throw new Error(`Marketaux API error: ${data.error.code} - ${data.error.message}`);
    }
    
    // Validate response structure
    if (!data.meta && !data.data) {
        throw new Error('Invalid API response format');
    }
    
    return data;
}