import pool from '../config/database';
import type { RowDataPacket } from 'mysql2';
import type { 
    MarketauxNewsArticle,
    NewsEntity,
    EntityHighlight,
    SimilarNews
} from '../../frontend/services/interface';

/**
 * Convert ISO 8601 datetime string to MySQL DATETIME format
 * MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
 * @param isoString ISO 8601 datetime string (e.g., '2026-01-03T10:22:56.000000Z')
 * @returns MySQL DATETIME format string (e.g., '2026-01-03 10:22:56')
 */
function convertToMySQLDateTime(isoString: string): string {
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date string');
        }
        
        // Format: YYYY-MM-DD HH:MM:SS
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('Error converting datetime:', isoString, error);
        // Return current datetime as fallback
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}

/**
 * News article data for database storage
 */
export interface NewsArticleData {
    uuid: string;
    title: string;
    description?: string;
    snippet?: string;
    url: string;
    image_url?: string;
    language: string;
    published_at: string; // ISO datetime string
    source: string;
}

/**
 * News article row from database
 */
interface NewsArticleRow extends RowDataPacket {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    snippet: string | null;
    url: string;
    image_url: string | null;
    language: string;
    published_at: Date | string;
    source: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * News article with all related data
 */
export interface NewsArticleWithRelations extends NewsArticleData {
    categories?: string[];
    entities?: NewsEntity[];
    similar?: SimilarNews[];
}

/**
 * Save a news article to database
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to handle duplicates
 */
export async function saveNewsArticle(data: NewsArticleData): Promise<void> {
        await pool.execute(
            `INSERT INTO news_articles 
            (uuid, title, description, snippet, url, image_url, language, published_at, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            snippet = VALUES(snippet),
            url = VALUES(url),
            image_url = VALUES(image_url),
            language = VALUES(language),
            published_at = VALUES(published_at),
            source = VALUES(source)`,
            [
                data.uuid,
                data.title,
                data.description || null,
                data.snippet || null,
                data.url,
                data.image_url || null,
                data.language,
                convertToMySQLDateTime(data.published_at),
                data.source
            ]
        );
}

/**
 * Save news categories
 */
export async function saveNewsCategories(
    newsUuid: string, 
    categories: string[]
): Promise<void> {
    if (categories.length === 0) return;
    
    // Delete existing categories for this news
    await pool.execute(
        'DELETE FROM news_categories WHERE news_uuid = ?',
        [newsUuid]
    );
    
    // Insert new categories
    const values = categories.map(() => '(?, ?)').join(', ');
    const params = categories.flatMap(category => [newsUuid, category]);
    
    await pool.execute(
        `INSERT INTO news_categories (news_uuid, category) VALUES ${values}`,
        params
    );
}

/**
 * Save news entities and return entity IDs
 */
export async function saveNewsEntities(
    newsUuid: string,
    entities: NewsEntity[]
): Promise<Map<string, number>> {
    if (entities.length === 0) return new Map();
    
    const entityIdMap = new Map<string, number>();
    
    for (const entity of entities) {
        // Insert entity
        const [result] = await pool.execute(
            `INSERT INTO news_entities 
            (news_uuid, symbol, name, exchange, exchange_long, country, type, industry, match_score, sentiment_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            exchange = VALUES(exchange),
            exchange_long = VALUES(exchange_long),
            country = VALUES(country),
            type = VALUES(type),
            industry = VALUES(industry),
            match_score = VALUES(match_score),
            sentiment_score = VALUES(sentiment_score)`,
            [
                newsUuid,
                entity.symbol || null,
                entity.name,
                entity.exchange || null,
                entity.exchange_long || null,
                entity.country || null,
                entity.type || null,
                entity.industry || null,
                entity.match_score || null,
                entity.sentiment_score || null
            ]
        ) as any;
        
        // Get the entity ID (either from insert or existing record)
        let entityId: number;
        if (result.insertId) {
            entityId = result.insertId;
        } else {
            // If duplicate, get existing ID
            const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM news_entities WHERE news_uuid = ? AND symbol = ? AND name = ?',
                [newsUuid, entity.symbol || null, entity.name]
            );
            entityId = rows[0]?.id;
        }
        
        if (entityId) {
            entityIdMap.set(`${entity.symbol || ''}_${entity.name}`, entityId);
            
            // Save entity highlights
            if (entity.highlights && entity.highlights.length > 0) {
                await saveNewsEntityHighlights(entityId, entity.highlights);
            }
        }
    }
    
    return entityIdMap;
}

/**
 * Save entity highlights
 */
export async function saveNewsEntityHighlights(
    entityId: number,
    highlights: EntityHighlight[]
): Promise<void> {
    if (highlights.length === 0) return;
    
    // Delete existing highlights for this entity
    await pool.execute(
        'DELETE FROM news_entity_highlights WHERE entity_id = ?',
        [entityId]
    );
    
    // Insert new highlights
    const values = highlights.map(() => '(?, ?, ?, ?)').join(', ');
    const params = highlights.flatMap(highlight => [
        entityId,
        highlight.highlight,
        highlight.sentiment || null,
        highlight.highlighted_in || null
    ]);
    
    await pool.execute(
        `INSERT INTO news_entity_highlights (entity_id, highlight, sentiment, highlighted_in) 
        VALUES ${values}`,
        params
    );
}

/**
 * Save similar news articles
 */
export async function saveSimilarNews(
    newsUuid: string,
    similarNews: SimilarNews[]
): Promise<void> {
    if (similarNews.length === 0) return;
    
    // Delete existing similar news for this article
    await pool.execute(
        'DELETE FROM news_similar WHERE news_uuid = ?',
        [newsUuid]
    );
    
    // Insert new similar news
    const values = similarNews.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const params = similarNews.flatMap(similar => [
        newsUuid,
        similar.uuid,
        similar.title || null,
        similar.published_at ? convertToMySQLDateTime(similar.published_at) : null,
        similar.source || null
    ]);
    
    await pool.execute(
        `INSERT INTO news_similar (news_uuid, similar_uuid, similar_title, similar_published_at, similar_source)
        VALUES ${values}`,
        params
    );
}

/**
 * Save complete news article with all related data
 * This is the main function to use when saving news from API
 */
export async function saveNewsArticleWithRelations(
    article: MarketauxNewsArticle
): Promise<void> {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
        // 1. Save main article
        await connection.execute(
            `INSERT INTO news_articles 
            (uuid, title, description, snippet, url, image_url, language, published_at, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            snippet = VALUES(snippet),
            url = VALUES(url),
            image_url = VALUES(image_url),
            language = VALUES(language),
            published_at = VALUES(published_at),
            source = VALUES(source)`,
            [
                article.uuid,
                article.title,
                article.description || null,
                article.snippet || null,
                article.url,
                article.image_url || null,
                article.language,
                convertToMySQLDateTime(article.published_at),
                article.source
            ]
        );
        
        // 2. Save categories
        if (article.categories && article.categories.length > 0) {
            await connection.execute(
                'DELETE FROM news_categories WHERE news_uuid = ?',
                [article.uuid]
            );
            
            const categoryValues = article.categories.map(() => '(?, ?)').join(', ');
            const categoryParams = article.categories.flatMap(category => [article.uuid, category]);
            
            await connection.execute(
                `INSERT INTO news_categories (news_uuid, category) VALUES ${categoryValues}`,
                categoryParams
            );
        }
        
        // 3. Save entities and highlights
        if (article.entities && article.entities.length > 0) {
            // Delete existing entities for this news
            await connection.execute(
                'DELETE FROM news_entities WHERE news_uuid = ?',
                [article.uuid]
            );
            
            for (const entity of article.entities) {
                const [result] = await connection.execute(
                    `INSERT INTO news_entities 
                    (news_uuid, symbol, name, exchange, exchange_long, country, type, industry, match_score, sentiment_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        article.uuid,
                        entity.symbol || null,
                        entity.name,
                        entity.exchange || null,
                        entity.exchange_long || null,
                        entity.country || null,
                        entity.type || null,
                        entity.industry || null,
                        entity.match_score || null,
                        entity.sentiment_score || null
                    ]
                ) as any;
                
                const entityId = result.insertId;
                
                // Save highlights
                if (entity.highlights && entity.highlights.length > 0) {
                    const highlightValues = entity.highlights.map(() => '(?, ?, ?, ?)').join(', ');
                    const highlightParams = entity.highlights.flatMap(highlight => [
                        entityId,
                        highlight.highlight,
                        highlight.sentiment || null,
                        highlight.highlighted_in || null
                    ]);
                    
                    await connection.execute(
                        `INSERT INTO news_entity_highlights (entity_id, highlight, sentiment, highlighted_in) 
                        VALUES ${highlightValues}`,
                        highlightParams
                    );
                }
            }
        }
        
        // 4. Save similar news
        if (article.similar && article.similar.length > 0) {
            await connection.execute(
                'DELETE FROM news_similar WHERE news_uuid = ?',
                [article.uuid]
            );
            
            const similarValues = article.similar.map(() => '(?, ?, ?, ?, ?)').join(', ');
                    const similarParams = article.similar.flatMap(similar => [
                        article.uuid,
                        similar.uuid,
                        similar.title || null,
                        similar.published_at ? convertToMySQLDateTime(similar.published_at) : null,
                        similar.source || null
                    ]);
            
            await connection.execute(
                `INSERT INTO news_similar (news_uuid, similar_uuid, similar_title, similar_published_at, similar_source)
                VALUES ${similarValues}`,
                similarParams
            );
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Get news articles by date
 */
export async function getNewsByDate(date: string): Promise<NewsArticleWithRelations[]> {
    const [rows] = await pool.execute<NewsArticleRow[]>(
        `SELECT uuid, title, description, snippet, url, image_url, language, published_at, source
        FROM news_articles
        WHERE DATE(published_at) = ?
        ORDER BY published_at DESC`,
        [date]
    );
    
    const articles: NewsArticleWithRelations[] = [];
    
    for (const row of rows) {
        const article: NewsArticleWithRelations = {
            uuid: row.uuid,
            title: row.title,
            description: row.description || undefined,
            snippet: row.snippet || undefined,
            url: row.url,
            image_url: row.image_url || undefined,
            language: row.language,
            published_at: typeof row.published_at === 'string' 
                ? row.published_at 
                : row.published_at.toISOString(),
            source: row.source
        };
        
        // Get categories
        const [categories] = await pool.execute<RowDataPacket[]>(
            'SELECT category FROM news_categories WHERE news_uuid = ?',
            [row.uuid]
        );
        article.categories = categories.map(c => c.category);
        
        // Get entities with highlights
        const [entities] = await pool.execute<RowDataPacket[]>(
            `SELECT id, symbol, name, exchange, exchange_long, country, type, industry, match_score, sentiment_score
            FROM news_entities WHERE news_uuid = ?`,
            [row.uuid]
        );
        
        article.entities = await Promise.all(
            entities.map(async (entityRow) => {
                const [highlights] = await pool.execute<RowDataPacket[]>(
                    'SELECT highlight, sentiment, highlighted_in FROM news_entity_highlights WHERE entity_id = ?',
                    [entityRow.id]
                );
                
                return {
                    symbol: entityRow.symbol || '',
                    name: entityRow.name,
                    exchange: entityRow.exchange || '',
                    exchange_long: entityRow.exchange_long || '',
                    country: entityRow.country || '',
                    type: entityRow.type || '',
                    industry: entityRow.industry || '',
                    match_score: entityRow.match_score || 0,
                    sentiment_score: entityRow.sentiment_score || 0,
                    highlights: highlights.map(h => ({
                        highlight: h.highlight,
                        sentiment: h.sentiment || 0,
                        highlighted_in: h.highlighted_in || ''
                    }))
                };
            })
        );
        
        // Get similar news
        const [similar] = await pool.execute<RowDataPacket[]>(
            'SELECT similar_uuid, similar_title, similar_published_at, similar_source FROM news_similar WHERE news_uuid = ?',
            [row.uuid]
        );
        article.similar = similar.map(s => ({
            uuid: s.similar_uuid,
            title: s.similar_title || '',
            published_at: s.similar_published_at || '',
            source: s.similar_source || ''
        }));
        
        articles.push(article);
    }
    
    return articles;
}

/**
 * Get headline news for a specific date
 */
export async function getHeadlineNews(date: string): Promise<NewsArticleWithRelations[]> {
    const [rows] = await pool.execute<NewsArticleRow[]>(
        `SELECT n.uuid, n.title, n.description, n.snippet, n.url, n.image_url, n.language, n.published_at, n.source
        FROM news_articles n
        INNER JOIN news_daily_cache c ON n.uuid = c.news_uuid
        WHERE c.date = ? AND c.is_headline = TRUE
        ORDER BY c.priority DESC, n.published_at DESC`,
        [date]
    );
    
    // Reuse getNewsByDate logic for building full article objects
    // For simplicity, we'll get the full articles
    const uuids = rows.map(r => r.uuid);
    if (uuids.length === 0) return [];
    
    const articles: NewsArticleWithRelations[] = [];
    
    for (const articleUuid of uuids) {
        const [articleRows] = await pool.execute<NewsArticleRow[]>(
            `SELECT uuid, title, description, snippet, url, image_url, language, published_at, source
            FROM news_articles WHERE uuid = ?`,
            [articleUuid]
        );
        
        if (articleRows.length === 0) continue;
        
        const row = articleRows[0];
        const article: NewsArticleWithRelations = {
            uuid: row.uuid,
            title: row.title,
            description: row.description || undefined,
            snippet: row.snippet || undefined,
            url: row.url,
            image_url: row.image_url || undefined,
            language: row.language,
            published_at: typeof row.published_at === 'string' 
                ? row.published_at 
                : row.published_at.toISOString(),
            source: row.source
        };
        
        // Get categories, entities, similar (same as getNewsByDate)
        const [categories] = await pool.execute<RowDataPacket[]>(
            'SELECT category FROM news_categories WHERE news_uuid = ?',
            [row.uuid]
        );
        article.categories = categories.map(c => c.category);
        
        articles.push(article);
    }
    
    return articles;
}

/**
 * Check if news exists for a specific date
 */
export async function checkNewsExistsForDate(date: string): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM news_articles WHERE DATE(published_at) = ?`,
        [date]
    );
    
    return rows[0]?.count > 0;
}

/**
 * Mark news articles as headlines in daily cache
 */
export async function markHeadlineNews(newsUuids: string[], date: string, priorities?: number[]): Promise<void> {
    if (newsUuids.length === 0) return;
    
    const values = newsUuids.map(() => 
        `(?, ?, TRUE, ?)`
    ).join(', ');
    
    const params = newsUuids.flatMap((newsUuid, index) => [
        newsUuid,
        date,
        priorities && priorities[index] !== undefined ? priorities[index] : 0
    ]);
    
    await pool.execute(
        `INSERT INTO news_daily_cache (news_uuid, date, is_headline, priority)
        VALUES ${values}
        ON DUPLICATE KEY UPDATE
        is_headline = TRUE,
        priority = VALUES(priority)`,
        params
    );
}

/**
 * Get news articles with pagination
 */
export async function getNewsWithPagination(
    date?: string,
    limit: number = 50,
    page: number = 1
): Promise<{ articles: NewsArticleWithRelations[]; total: number }> {
    const offset = (page - 1) * limit;
    
    let countQuery = 'SELECT COUNT(*) as total FROM news_articles';
    let dataQuery = `SELECT uuid, title, description, snippet, url, image_url, language, published_at, source
        FROM news_articles`;
    const params: any[] = [];
    
    if (date) {
        countQuery += ' WHERE DATE(published_at) = ?';
        dataQuery += ' WHERE DATE(published_at) = ?';
        params.push(date);
    }
    
    dataQuery += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    
    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, date ? [date] : []);
    const total = countRows[0]?.total || 0;
    
    const [rows] = await pool.execute<NewsArticleRow[]>(dataQuery, [...params, limit, offset]);
    
    // Build articles (simplified version - you can enhance with full relations if needed)
    const articles: NewsArticleWithRelations[] = rows.map(row => ({
        uuid: row.uuid,
        title: row.title,
        description: row.description || undefined,
        snippet: row.snippet || undefined,
        url: row.url,
        image_url: row.image_url || undefined,
        language: row.language,
        published_at: typeof row.published_at === 'string' 
            ? row.published_at 
            : row.published_at.toISOString(),
        source: row.source
    }));
    
    return { articles, total };
}

