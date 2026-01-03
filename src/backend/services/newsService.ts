import { 
    getNewsByDate, 
    checkNewsExistsForDate,
    saveNewsArticleWithRelations,
    markHeadlineNews,
    getHeadlineNews,
    type NewsArticleWithRelations
} from '../models/News';
import { fetchNewsFromAPI, type MarketauxNewsParams } from './marketauxService';
import type { MarketauxNewsArticle } from '../../frontend/services/interface';

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if news exists for today, if not, fetch from API
 * This is the main function called by the API route
 * 
 * @param params Optional parameters for filtering news (symbols, limit, etc.)
 * @returns Promise with news articles
 */
export async function checkAndGetNews(
    params: MarketauxNewsParams = {}
): Promise<NewsArticleWithRelations[]> {
    const today = getTodayDate();
    
    // Step 1: Check if data exists in database for today
    const hasNews = await checkNewsExistsForDate(today);
    
    // Step 2: If no data for today, fetch from API and save
    if (!hasNews) {
        console.log(`No news data for ${today}, fetching from API...`);
        return await fetchAndSaveNews(today, params);
    } else {
        console.log(`Using cached news data for ${today}`);
        // Get news from database
        let news = await getNewsByDate(today);
        
        // If filters are specified, we might need to fetch fresh data
        // For now, return cached data. In the future, you could add filtering logic here
        if (params.symbols || params.sentiment_gte !== undefined || params.sentiment_lte !== undefined) {
            console.log('Filters specified, fetching fresh data from API...');
            return await fetchAndSaveNews(today, params);
        }
        
        return news;
    }
}

/**
 * Fetch news from API and save to database
 * This function is called when today's data doesn't exist or filters are specified
 * 
 * @param date Date in YYYY-MM-DD format
 * @param params Optional parameters for filtering news
 * @returns Promise with news articles
 */
async function fetchAndSaveNews(
    date: string,
    params: MarketauxNewsParams = {}
): Promise<NewsArticleWithRelations[]> {
    try {
        // Set default limit if not specified
        const limit = params.limit || 50;
        
        // Fetch news from API
        const apiResponse = await fetchNewsFromAPI({
            ...params,
            limit: Math.min(limit, 100), // API max limit is 100
            language: params.language || 'en'
        });
        
        if (!apiResponse.data || apiResponse.data.length === 0) {
            console.log('No news articles returned from API');
            return [];
        }
        
        // Save each article to database
        const savedArticles: NewsArticleWithRelations[] = [];
        const headlineUuids: string[] = [];
        
        for (const article of apiResponse.data) {
            try {
                // Save article with all relations (categories, entities, highlights, similar)
                await saveNewsArticleWithRelations(article);
                
                // Convert to NewsArticleWithRelations format for return
                const savedArticle: NewsArticleWithRelations = {
                    uuid: article.uuid,
                    title: article.title,
                    description: article.description,
                    snippet: article.snippet,
                    url: article.url,
                    image_url: article.image_url,
                    language: article.language,
                    published_at: article.published_at,
                    source: article.source,
                    categories: article.categories,
                    entities: article.entities,
                    similar: article.similar
                };
                
                savedArticles.push(savedArticle);
                
                // Mark articles with high sentiment or high match scores as potential headlines
                if (article.entities && article.entities.length > 0) {
                    const hasHighSentiment = article.entities.some(
                        e => Math.abs(e.sentiment_score) > 0.3
                    );
                    const hasHighMatch = article.entities.some(
                        e => e.match_score > 20
                    );
                    
                    if (hasHighSentiment || hasHighMatch) {
                        headlineUuids.push(article.uuid);
                    }
                }
            } catch (error) {
                console.error(`Failed to save article ${article.uuid}:`, error);
                // Continue with other articles even if one fails
            }
        }
        
        // Mark headlines in cache table (optional, for quick headline retrieval)
        if (headlineUuids.length > 0) {
            try {
                // Assign priorities based on sentiment scores
                const priorities = headlineUuids.map(uuid => {
                    const article = apiResponse.data?.find(a => a.uuid === uuid);
                    if (article?.entities && article.entities.length > 0) {
                        const maxSentiment = Math.max(
                            ...article.entities.map(e => Math.abs(e.sentiment_score))
                        );
                        return Math.round(maxSentiment * 100); // Convert to 0-100 scale
                    }
                    return 0;
                });
                
                await markHeadlineNews(headlineUuids, date, priorities);
            } catch (error) {
                console.error('Failed to mark headline news:', error);
                // Non-critical error, continue
            }
        }
        
        console.log(`Successfully saved ${savedArticles.length} news articles for ${date}`);
        return savedArticles;
        
    } catch (error) {
        console.error('Error fetching and saving news:', error);
        throw error;
    }
}

/**
 * Get news with pagination support
 * Checks database first, then API if needed
 * 
 * @param params Query parameters including pagination
 * @returns Promise with paginated news articles and total count
 */
export async function getNewsWithPagination(
    params: MarketauxNewsParams & { page?: number; limit?: number } = {}
): Promise<{ articles: NewsArticleWithRelations[]; total: number; page: number; limit: number }> {
    const today = getTodayDate();
    const page = params.page || 1;
    const limit = params.limit || 50;
    
    // Check if we have data in database
    const hasNews = await checkNewsExistsForDate(today);
    
    if (!hasNews || params.symbols || params.sentiment_gte !== undefined || params.sentiment_lte !== undefined) {
        // Fetch from API if no data or filters specified
        const articles = await fetchAndSaveNews(today, params);
        
        // Simple pagination on in-memory array
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        return {
            articles: paginatedArticles,
            total: articles.length,
            page,
            limit
        };
    } else {
        // Use database pagination (if you implement it in News model)
        // For now, get all and paginate in memory
        const allNews = await getNewsByDate(today);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArticles = allNews.slice(startIndex, endIndex);
        
        return {
            articles: paginatedArticles,
            total: allNews.length,
            page,
            limit
        };
    }
}

/**
 * Get headline news for today
 * 
 * @returns Promise with headline news articles
 */
export async function getHeadlineNewsForToday(): Promise<NewsArticleWithRelations[]> {
    const today = getTodayDate();
    
    // First check if we have news in database
    const hasNews = await checkNewsExistsForDate(today);
    
    if (!hasNews) {
        // Fetch general news first
        await checkAndGetNews();
    }
    
    // Get headlines from database
    return await getHeadlineNews(today);
}

