import express from 'express';
import { checkAndGetCurrencyRates, checkAndGetCommodityPrices } from '../services/dataService';

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

export default router;