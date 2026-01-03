# Stock Tracker

A modern full-stack web application for tracking stock prices, currency exchange rates, and commodity prices using real-time API integration. Built with React, TypeScript, Node.js, Express, and MySQL.

## 🚀 Features

### Frontend
- **Market Overview**: Real-time display of major currency pairs (USD/CNY, EUR/USD, GBP/USD, USD/JPY)
- **Commodity Prices**: Auto-scrolling display of popular commodity prices (Gold, Silver, Oil, etc.)
- **Stock Search with Autocomplete**: Intelligent search with debounced suggestions as you type
- **Real-time Stock Quotes**: Get up-to-date stock prices, changes, and market data
- **Financial News**: 
  - Scrolling headline news ticker displaying today's important news
  - News filtering by stock symbols, sentiment, and categories
  - Entity recognition showing related stocks and sentiment scores
  - Beautiful card-based news layout with images and metadata
- **Multi-page Navigation**: Clean routing with Home, Stock, and News pages
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Error Handling**: Comprehensive error handling for API calls and user input
- **Loading States**: Smooth loading indicators for better UX

### Backend
- **RESTful API**: Express.js server with organized route structure
- **Database Caching**: MySQL database for storing and caching market data and news
- **Smart Data Fetching**: Automatic check for today's data, fetch from API only when needed
- **News Management**: 
  - Daily news caching with automatic updates
  - Headline news identification based on sentiment and match scores
  - Full news article storage with entities, categories, and highlights
  - Transaction-based data persistence for data integrity
- **Rate Limit Management**: Built-in delays to comply with API rate limits
- **Data Persistence**: Daily data storage with automatic upsert logic

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.11.0
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Database Client**: mysql2/promise
- **Environment**: dotenv

### External APIs
- **Alpha Vantage API**: Stock quotes, currency exchange rates, and market data
- **Marketaux API**: Financial and market news

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Alpha Vantage API key** ([Get one here](https://www.alphavantage.co/support/#api-key))
- **Marketaux API key** ([Get one here](https://www.marketaux.com/))

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd web_stock
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

Create a MySQL database:

```sql
CREATE DATABASE stock_tracker;
```

Then create the required tables. Run the following SQL commands:

```sql
-- Currency rates table
CREATE TABLE currency_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    exchange_rate VARCHAR(50) NOT NULL,
    bid_price VARCHAR(50),
    ask_price VARCHAR(50),
    time_zone VARCHAR(50),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_date (from_currency, to_currency, date)
);

-- Commodity prices table
CREATE TABLE commodity_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    price VARCHAR(50) NOT NULL,
    open_price VARCHAR(50),
    high_price VARCHAR(50),
    low_price VARCHAR(50),
    previous_close VARCHAR(50),
    change_amount VARCHAR(50),
    change_percent VARCHAR(50),
    volume VARCHAR(50),
    latest_trading_day DATE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_symbol_date (symbol, date)
);
```

**For News tables**, you'll need to create the news-related tables. The schema includes:
- `news_articles`: Main news articles table (uuid, title, description, snippet, url, image_url, language, published_at, source)
- `news_categories`: News categories (news_uuid, category)
- `news_entities`: Stock entities identified in articles (symbol, name, exchange, country, type, industry, match_score, sentiment_score)
- `news_entity_highlights`: Entity highlight information (entity_id, highlight, sentiment, highlighted_in)
- `news_similar`: Similar news articles (news_uuid, similar_uuid, similar_title, similar_published_at, similar_source)
- `news_daily_cache`: Daily headline news cache (news_uuid, date, is_headline, priority)

Refer to the `src/backend/models/News.ts` file for the complete table structure and relationships.

### 4. Set up environment variables

Create a `.env` file in the root directory:

```env
# Alpha Vantage API
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here

# Marketaux API
VITE_MARKETAUX_API_KEY=your_marketaux_api_key_here

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stock_tracker

# Server Configuration
PORT=3001
```

Replace the placeholder values with your actual configuration:
- `your_api_key_here`: Your Alpha Vantage API key
- `your_marketaux_api_key_here`: Your Marketaux API key ([Get one here](https://www.marketaux.com/))
- `your_mysql_password`: Your MySQL root password (or your database user password)

### 5. Start the development servers

#### Option 1: Run frontend and backend separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option 2: Run both concurrently (if configured)

```bash
npm run dev:all
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/health`

## 📁 Project Structure

```
StockTracker_demo/
├── src/
│   ├── frontend/
│   │   ├── components/          # Reusable components
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   └── Layout.tsx       # Main layout wrapper
│   │   ├── pages/               # Page components
│   │   │   ├── Home.tsx         # Home page with market overview
│   │   │   ├── Stock.tsx        # Stock search and display
│   │   │   └── News.tsx         # News page with scrolling headlines
│   │   ├── services/            # API services
│   │   │   └── interface.ts     # TypeScript interfaces
│   │   ├── App.tsx              # Main app component with routes
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles with Tailwind
│   └── backend/
│       ├── config/              # Configuration files
│       │   └── database.ts      # MySQL connection pool
│       ├── models/              # Database models
│       │   ├── CurrencyRate.ts  # Currency rate model
│       │   ├── CommodityPrice.ts # Commodity price model
│       │   └── News.ts          # News article model
│       ├── services/            # Business logic
│       │   ├── alphaVantageService.ts # Alpha Vantage API calls
│       │   ├── marketauxService.ts # Marketaux API calls
│       │   ├── dataService.ts   # Data fetching and caching logic
│       │   └── newsService.ts   # News data fetching and caching logic
│       ├── routes/              # API routes
│       │   └── api.ts           # API endpoints
│       └── server.ts            # Express server entry point
├── public/                      # Static assets
├── .env                        # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Usage

### Home Page - Market Overview

The Home page displays:
- **Major Currency Pairs**: Real-time exchange rates for USD/CNY, EUR/USD, GBP/USD, USD/JPY
- **Popular Commodities**: Auto-scrolling display of commodity prices including:
  - Gold (GLD)
  - Silver (SLV)
  - Crude Oil (USO)
  - Copper (CPER)
  - Corn (CORN)
  - Wheat (WEAT)
  - Soybean (SOYB)
  - Cocoa (NIB)

### Stock Search

1. Navigate to the **Stock** page
2. Type a stock symbol or company name in the search bar
3. Select from the autocomplete suggestions
4. View real-time stock data including:
   - Current price
   - Price change and percentage
   - Open, high, low prices
   - Trading volume
   - Previous close
   - Latest trading day

### Financial News

1. Navigate to the **News** page
2. View the scrolling headline ticker at the top showing today's important news
3. Use filters to customize your news feed:
   - **Stock Symbols**: Filter news by specific stocks (e.g., "AAPL,TSLA")
   - **Sentiment**: Filter by positive, negative, or neutral sentiment
   - **Headlines Only**: Toggle to show only headline news
4. Each news article displays:
   - Title, description, and image
   - Related stock entities with sentiment scores
   - Categories and tags
   - Source and publication time
   - Direct link to the original article

### API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/currency-rates` - Get today's currency exchange rates
- `GET /api/commodity-prices` - Get today's commodity prices
- `GET /api/news` - Get today's financial news
  - Query parameters:
    - `symbols`: Comma-separated stock symbols (e.g., "AAPL,TSLA")
    - `limit`: Number of results (default: 50, max: 100)
    - `page`: Page number for pagination
    - `language`: Language code (default: "en")
    - `sentiment_gte`: Minimum sentiment score (-1 to 1)
    - `sentiment_lte`: Maximum sentiment score (-1 to 1)
    - `countries`: Comma-separated country codes
    - `entity_types`: Comma-separated entity types
    - `industries`: Comma-separated industries
    - `filter_entities`: Filter entities to match query (true/false)
    - `must_have_entities`: Only return articles with entities (true/false)
- `GET /api/news?headlines=true` - Get today's headline news
- `GET /health` - Server health check

## 🔑 API Configuration

This project uses multiple APIs for market data and news.

### Alpha Vantage API

Used for stock quotes, currency exchange rates, and market data.

**API Endpoints Used:**
- `CURRENCY_EXCHANGE_RATE`: Real-time currency exchange rates
- `GLOBAL_QUOTE`: Real-time stock quotes
- `SYMBOL_SEARCH`: Stock symbol search and autocomplete

**Rate Limits:**
The free tier of Alpha Vantage API has a limit of **5 API calls per minute**. The application includes:
- Automatic delays between API calls (12 seconds)
- Database caching to minimize API calls
- On-demand fetching (only fetches if today's data doesn't exist)

### Marketaux API

Used for financial and market news.

**API Endpoints Used:**
- `GET /v1/news/all`: Get financial and market news

**Features:**
- Supports filtering by stock symbols, sentiment, countries, industries, etc.
- Automatic database caching (news is stored and retrieved from database)
- Headline news identification based on sentiment and match scores
- Daily news updates (fetches once per day, then serves from database)

**Rate Limits:**
Check [Marketaux documentation](https://www.marketaux.com/documentation) for current rate limits. The application includes database caching to minimize API calls.

## 📝 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server (requires `tsx` or `ts-node`)
- `npm run dev:all` - Run both frontend and backend concurrently (if configured)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

### Currency Rates Table

Stores daily currency exchange rates with timezone information.

### Commodity Prices Table

Stores daily commodity prices with all price-related fields as strings for flexibility.

### News Tables

The news feature uses multiple related tables:
- `news_articles`: Main news articles table
- `news_categories`: News categories (many-to-many relationship)
- `news_entities`: Stock entities identified in articles
- `news_entity_highlights`: Entity highlight information
- `news_similar`: Similar news articles
- `news_daily_cache`: Daily headline news cache for quick retrieval

Refer to the `src/backend/models/News.ts` file for the complete table structure, relationships, and field definitions.

### Data Caching Strategy

- **Market Data**: Fetched from Alpha Vantage API only once per day
- **News Data**: Fetched from Marketaux API only once per day
- When a page is opened, the backend checks if today's data exists in the database
- If data exists, it's returned from the database (fast)
- If not, data is fetched from API, saved to database, and returned
- Uses `ON DUPLICATE KEY UPDATE` to handle data updates
- News articles are stored with full relationships (entities, categories, highlights) using database transactions

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Environment Variables in Production

Make sure to set all environment variables in your deployment platform:

**Frontend (Vite):**
- `VITE_ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key

**Backend:**
- `VITE_ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key
- `VITE_MARKETAUX_API_KEY` - Marketaux API key
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `PORT` - Server port (default: 3001)

**Deployment Platforms:**
- **Vercel**: Add in Project Settings → Environment Variables
- **Netlify**: Add in Site Settings → Environment Variables
- **Railway/Render**: Add in Environment Variables section

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your API keys and database credentials secure
- Use environment variables for all sensitive configuration
- Consider using a secrets management service for production

## 🐛 Troubleshooting

### MySQL Connection Issues

If you see `ECONNREFUSED` errors:

1. **Check MySQL service is running:**
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl start mysql
   # or
   brew services start mysql
   ```

2. **Verify database credentials** in `.env` file

3. **Test connection:**
   ```bash
   mysql -u root -p -h localhost
   ```

### API Key Issues

If you see "API key is not configured" error:
1. Check that your `.env` file exists in the root directory
2. Verify the variable name is exactly `VITE_ALPHA_VANTAGE_API_KEY` for frontend
3. Restart your development server after creating/updating `.env`

### Rate Limit Errors

If you see "API call frequency limit exceeded":
- The free tier allows 5 calls per minute
- The backend includes automatic delays (12 seconds) between calls
- Wait a minute before making more requests
- Consider upgrading to a paid plan for higher limits

### Database Date Errors

If you see "Incorrect date value" or "Incorrect datetime value" errors:
- Ensure the `date` column in database tables is of type `DATE`
- Ensure the `published_at` column in `news_articles` is of type `DATETIME`
- The application automatically converts ISO 8601 format to MySQL DATETIME format
- Check that date values are in `YYYY-MM-DD` format for DATE columns
- Check that datetime values are in `YYYY-MM-DD HH:MM:SS` format for DATETIME columns
- Verify parameter order in SQL INSERT statements

### Build Issues

If you encounter TypeScript errors during build:
```bash
npm run lint
```
Fix any linting errors before building.

## 📚 Learning Resources

This project demonstrates:
- **React Hooks**: useState, useRef, useEffect
- **TypeScript**: Interfaces, types, type safety
- **API Integration**: RESTful APIs, error handling
- **Debouncing**: Performance optimization for search
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first CSS framework
- **Node.js/Express**: Backend server development
- **MySQL**: Database design and queries
- **Environment Variables**: Configuration management
- **Database Caching**: Data persistence and optimization

## 🤝 Contributing

This is a demo project for learning purposes. Feel free to fork and experiment!

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for providing the market data API
- [Vite](https://vite.dev/) for the build tool
- [React](https://react.dev/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Express](https://expressjs.com/) for the backend framework
- [MySQL](https://www.mysql.com/) for the database

---

## 📸 Features Showcase

### News Page Features
- **Scrolling Headline Ticker**: Auto-scrolling display of today's headline news with breaking news badges
- **Advanced Filtering**: Filter by stock symbols, sentiment scores, and more
- **Entity Recognition**: See which stocks are mentioned in each article with sentiment analysis
- **Rich Metadata**: Categories, publication dates, sources, and direct article links
- **Responsive Cards**: Beautiful card-based layout with images and hover effects

### Data Management
- **Automatic Daily Updates**: News and market data are automatically fetched and cached daily
- **Smart Caching**: Database-first approach reduces API calls and improves performance
- **Transaction Safety**: News articles are saved with full data integrity using database transactions

---

**Note**: This is a demo project. For production use, consider implementing additional features like:
- User authentication and authorization
- Watchlists and favorites
- Historical data charts
- Real-time WebSocket updates
- Advanced error logging and monitoring
- API rate limiting middleware
- Database connection pooling optimization
