import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';

export interface CommodityPriceData {
    symbol: string;
    name: string;
    price: string;
    openPrice?: string;
    highPrice?: string;
    lowPrice?: string;
    previousClose?: string;
    changeAmount?: string;  
    changePercent?: string;
    volume?: string;
    unit: string;
    date: string;
}

interface CommodityPriceRow extends RowDataPacket {
    symbol: string;
    name: string;
    price: string;
    open_price: string | null;
    high_price: string | null;
    low_price: string | null;
    previous_close: string | null;
    change_amount: string | null;
    change_percent: string | null;
    volume: string | null;
    unit: string;
    date: string;
}

/**
 * Save commodity price to database
 */
export async function saveCommodityPrice(data: CommodityPriceData): Promise<void> {
    await pool.execute(
        `INSERT INTO commodity_prices 
        (symbol, name, price, open_price, high_price, low_price, 
        previous_close, change_amount, change_percent, volume, unit, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        open_price = VALUES(open_price),
        high_price = VALUES(high_price),
        low_price = VALUES(low_price),
        previous_close = VALUES(previous_close),
        change_amount = VALUES(change_amount),
        change_percent = VALUES(change_percent),
        volume = VALUES(volume)`,
        [data.symbol, data.name, data.price, data.openPrice, data.highPrice, 
        data.lowPrice, data.previousClose, data.changeAmount, data.changePercent,
        data.volume, data.unit, data.date]
    );
}

/**
 * Get commodity prices by date
 */
export async function getCommodityPricesByDate(date: string): Promise<CommodityPriceData[]> {
    const [rows] = await pool.execute<CommodityPriceRow[]>(
        `SELECT symbol, name, price, open_price, high_price, low_price, 
        previous_close, change_amount, change_percent, volume, unit, date
        FROM commodity_prices
        WHERE date = ?`,
        [date]
    );
    
    return rows.map(row => ({
        symbol: row.symbol,
        name: row.name,
        price: row.price,
        openPrice: row.open_price || undefined,
        highPrice: row.high_price || undefined,
        lowPrice: row.low_price || undefined,
        previousClose: row.previous_close || undefined,
        changeAmount: row.change_amount || undefined,
        changePercent: row.change_percent || undefined,
        volume: row.volume || undefined,
        unit: row.unit,
        date: row.date
    }));
}