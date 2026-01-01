# Stock Tracker

A modern web application for tracking stock prices and market data using real-time API integration. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Stock Search with Autocomplete**: Intelligent search with debounced suggestions as you type
- **Real-time Stock Quotes**: Get up-to-date stock prices, changes, and market data
- **Multi-page Navigation**: Clean routing with Home, Stock, and News pages
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Error Handling**: Comprehensive error handling for API calls and user input
- **Loading States**: Smooth loading indicators for better UX

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.11.0
- **Build Tool**: Vite
- **API**: Alpha Vantage API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Alpha Vantage API key ([Get one here](https://www.alphavantage.co/support/#api-key))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd web_stock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
   
   Replace `your_api_key_here` with your actual Alpha Vantage API key.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
web_stock/
├── src/
│   ├── frontend/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.tsx    # Navigation header
│   │   │   └── Layout.tsx    # Main layout wrapper
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Home page
│   │   │   ├── Stock.tsx     # Stock search and display
│   │   │   └── News.tsx      # News page
│   │   ├── services/         # API services
│   │   │   └── alphaVantage.ts # Alpha Vantage API integration
│   │   ├── App.tsx           # Main app component with routes
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Global styles with Tailwind
│   └── backend/              # Backend folder (for future use)
├── public/                   # Static assets
├── .env                      # Environment variables (not in git)
├── package.json
├── vite.config.ts
└── README.md
```

## 🎯 Usage

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

### Navigation

- **Home**: Dashboard (coming soon)
- **Stock**: Search and view stock information
- **News**: Stock news (coming soon)

## 🔑 API Configuration

This project uses the [Alpha Vantage API](https://www.alphavantage.co/) for stock data.

### API Endpoints Used

- `GLOBAL_QUOTE`: Real-time stock quotes
- `SYMBOL_SEARCH`: Stock symbol search and autocomplete

### Rate Limits

The free tier of Alpha Vantage API has a limit of **5 API calls per minute**. The application includes debouncing to minimize API calls during search.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Environment Variables in Production

Make sure to set the `VITE_ALPHA_VANTAGE_API_KEY` environment variable in your deployment platform:

- **Vercel**: Add in Project Settings → Environment Variables
- **Netlify**: Add in Site Settings → Environment Variables
- **GitHub Pages**: Use GitHub Secrets (if using GitHub Actions)

## 🔒 Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your API key secure and don't share it publicly

## 🐛 Troubleshooting

### API Key Issues

If you see "API key is not configured" error:
1. Check that your `.env` file exists in the root directory
2. Verify the variable name is exactly `VITE_ALPHA_VANTAGE_API_KEY`
3. Restart your development server after creating/updating `.env`

### Rate Limit Errors

If you see "API call frequency limit exceeded":
- The free tier allows 5 calls per minute
- Wait a minute before making more requests
- Consider upgrading to a paid plan for higher limits

### Build Issues

If you encounter TypeScript errors during build:
```bash
npm run lint
```
Fix any linting errors before building.

## 📚 Learning Resources

This project demonstrates:
- React Hooks (useState, useRef, useEffect)
- TypeScript interfaces and types
- API integration and error handling
- Debouncing for performance optimization
- React Router for navigation
- Tailwind CSS for styling
- Environment variable management

## 🤝 Contributing

This is a demo project for learning purposes. Feel free to fork and experiment!

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for providing the stock data API
- [Vite](https://vite.dev/) for the build tool
- [React](https://react.dev/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Note**: This is a demo project. For production use, consider implementing additional features like:
- User authentication
- Watchlists
- Historical data charts
- News integration
- Backend API for data caching
