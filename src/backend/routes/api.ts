import express from 'express';
import { checkAndGetCurrencyRates, checkAndGetCommodityPrices } from '../services/dataService';
import { checkAndGetNews, getNewsWithPagination, getHeadlineNewsForToday } from '../services/newsService';
import type { MarketauxNewsParams } from '../services/marketauxService';

const router = express.Router();

/**
 * GET /api/currency-rates
 * Get currency rates for today (auto-fetch from API if not in database)
 */
router.get('/currency-rates', async (req, res) => {
    try {
        const data = await checkAndGetCurrencyRates();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

/**
 * GET /api/commodity-prices
 * Get commodity prices for today (auto-fetch from API if not in database)
 */
router.get('/commodity-prices', async (req, res) => {
    try {
        const data = await checkAndGetCommodityPrices();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching commodity prices:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

/**
 * GET /api/news
 * Get news articles for today (auto-fetch from API if not in database)
 * 
 * Query parameters:
 * - symbols: Comma-separated stock symbols (e.g., "AAPL,TSLA")
 * - limit: Number of results (default: 50, max: 100)
 * - page: Page number (default: 1)
 * - language: Language code (default: "en")
 * - sentiment_gte: Minimum sentiment score (-1 to 1)
 * - sentiment_lte: Maximum sentiment score (-1 to 1)
 * - countries: Comma-separated country codes
 * - entity_types: Comma-separated entity types
 * - industries: Comma-separated industries
 * - filter_entities: Filter entities to match query (true/false)
 * - must_have_entities: Only return articles with entities (true/false)
 * - headlines: Get only headline news (true/false)
 */
router.get('/news', async (req, res) => {
    try {
        // Parse query parameters
        const {
            symbols,
            limit,
            page,
            language,
            sentiment_gte,
            sentiment_lte,
            countries,
            entity_types,
            industries,
            filter_entities,
            must_have_entities,
            headlines
        } = req.query;

        // Handle headlines request
        if (headlines === 'true') {
            const data = await getHeadlineNewsForToday();
            return res.json({ success: true, data });
        }

        // Build params object
        const params: MarketauxNewsParams = {};
        
        if (symbols && typeof symbols === 'string') {
            params.symbols = symbols;
        }
        if (limit) {
            const limitNum = parseInt(limit as string, 10);
            if (!isNaN(limitNum) && limitNum > 0) {
                params.limit = Math.min(limitNum, 100); // Max 100
            }
        }
        if (page) {
            const pageNum = parseInt(page as string, 10);
            if (!isNaN(pageNum) && pageNum > 0) {
                params.page = pageNum;
            }
        }
        if (language && typeof language === 'string') {
            params.language = language;
        }
        if (sentiment_gte) {
            const score = parseFloat(sentiment_gte as string);
            if (!isNaN(score)) {
                params.sentiment_gte = score;
            }
        }
        if (sentiment_lte) {
            const score = parseFloat(sentiment_lte as string);
            if (!isNaN(score)) {
                params.sentiment_lte = score;
            }
        }
        if (countries && typeof countries === 'string') {
            params.countries = countries;
        }
        if (entity_types && typeof entity_types === 'string') {
            params.entity_types = entity_types;
        }
        if (industries && typeof industries === 'string') {
            params.industries = industries;
        }
        if (filter_entities === 'true' || filter_entities === 'false') {
            params.filter_entities = filter_entities === 'true';
        }
        if (must_have_entities === 'true' || must_have_entities === 'false') {
            params.must_have_entities = must_have_entities === 'true';
        }

        // If pagination is requested, use pagination function
        if (page || limit) {
            const result = await getNewsWithPagination({
                ...params,
                page: params.page || 1,
                limit: params.limit || 50
            });
            return res.json({ 
                success: true, 
                data: result.articles,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }

        // Otherwise, use regular function
        const data = await checkAndGetNews(params);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

export default router;