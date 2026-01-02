import pool from "../config/database";
import type { RowDataPacket } from "mysql2";
export interface CurrencyRateData {
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    bidPrice?: number;
    askPrice?: number;
    timeZone?: string;
    date: string; // YYYY-MM-DD format
}

interface CurrencyRateRow extends RowDataPacket {
    from_currency: string;
    to_currency: string;
    exchange_rate: string | number;
    bid_price: string | number | null;
    ask_price: string | number | null;
    time_zone: string | null;
    date: string;
}

/**
 * Save currency rate to database
 */
export async function saveCurrencyRate(data: CurrencyRateData): Promise<void> {
    await pool.execute(
        `INSERT INTO currency_rates 
        (from_currency, to_currency, exchange_rate, bid_price, ask_price, time_zone, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        exchange_rate = VALUES(exchange_rate),
        bid_price = VALUES(bid_price),
        ask_price = VALUES(ask_price),
        time_zone = VALUES(time_zone)`,
        [data.fromCurrency, data.toCurrency, data.exchangeRate, 
        data.bidPrice, data.askPrice, data.timeZone, data.date]
    );
}

/**
 * Get currency rates by date
 */
export async function getCurrencyRatesByDate(date: string): Promise<CurrencyRateData[]> {
    const [rows] = await pool.execute<CurrencyRateRow[]>(
        `SELECT from_currency, to_currency, exchange_rate, bid_price, ask_price, time_zone, date
        FROM currency_rates
        WHERE date = ?`,
        [date]
    );
    
    return rows.map(row => ({
        fromCurrency: row.from_currency,
        toCurrency: row.to_currency,
        exchangeRate: typeof row.exchange_rate === 'string' 
            ? parseFloat(row.exchange_rate) 
            : row.exchange_rate,
        bidPrice: row.bid_price 
            ? (typeof row.bid_price === 'string' ? parseFloat(row.bid_price) : row.bid_price)
            : undefined,
        askPrice: row.ask_price 
            ? (typeof row.ask_price === 'string' ? parseFloat(row.ask_price) : row.ask_price)
            : undefined,
        timeZone: row.time_zone || undefined,
        date: row.date
    }));
}