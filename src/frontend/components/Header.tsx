import { Link, useLocation } from "react-router-dom";
export default function Header() {
    const location = useLocation();

    return (
        <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left side: Logo + Navigation */}
                    <div className="flex items-center space-x-8">
                        <div className="text-xl font-bold tracking-tight">
                            Stock Tracker
                        </div>
                        {/* Navigation will go here later */}
                        <nav className="flex items-center space-x-6">
                            <Link
                                to="/"
                                className={`text-base font-medium transition-colors cursor-pointer
                                    ${location.pathname === '/' 
                                        ? 'text-white border-b-2 border-white pb-1' 
                                        : 'text-gray-300 hover:text-white'}`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/stock"
                                className={`text-base font-medium transition-colors cursor-pointer
                                    ${location.pathname === '/stock' 
                                        ? 'text-white border-b-2 border-white pb-1' 
                                        : 'text-gray-300 hover:text-white'}`}
                            >
                                Stock
                            </Link>
                            <Link
                                to="/news"
                                className={`text-base font-medium transition-colors cursor-pointer
                                    ${location.pathname === '/news' 
                                        ? 'text-white border-b-2 border-white pb-1' 
                                        : 'text-gray-300 hover:text-white'}`}
                            >
                                News
                            </Link>
                        </nav>
                    </div>
                    
                    {/* Right side: Search bar (for later) */}
                    <div>
                        {/* Search bar will go here */}
                    </div>
                </div>
            </div>
        </header>
    )
}