import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Filter, Gamepad2, Home as HomeIcon, Crown, HelpCircle, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';
import { useSettings } from '../context/SettingsContext';

const CATEGORIES = [
  'All',
  'Action / Adventure',
  'Shooter / FPS',
  'RPG / Sci-Fi',
  'Mystery / Detective',
  'Bundle / Action',
  'Sports',
  'Casual / Family'
];

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAccountType, setSelectedAccountType] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGameForModal, setSelectedGameForModal] = useState(null);
  const { settings } = useSettings();

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await api.get('/products');
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Search submission handlers (only triggers on Search button click or Enter key)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleAccountTypeChange = (type) => {
    setSelectedAccountType(type);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Client filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !activeSearch ||
      (p.title && p.title.toLowerCase().includes(activeSearch.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(activeSearch.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    let matchesAccount = true;
    if (selectedAccountType === 'SIGN') matchesAccount = p.is_available_sign && p.price_sign != null;
    if (selectedAccountType === 'HOME') matchesAccount = p.is_available_home && p.price_home != null;
    if (selectedAccountType === 'FULL') matchesAccount = p.is_available_full && p.price_full != null;

    return matchesSearch && matchesCategory && matchesAccount;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      const pA = Math.min(...[a.price_sign, a.price_home, a.price_full].filter((x) => x != null));
      const pB = Math.min(...[b.price_sign, b.price_home, b.price_full].filter((x) => x != null));
      return pA - pB;
    }
    if (sortBy === 'price_desc') {
      const pA = Math.max(...[a.price_sign, a.price_home, a.price_full].filter((x) => x != null));
      const pB = Math.max(...[b.price_sign, b.price_home, b.price_full].filter((x) => x != null));
      return pB - pA;
    }
    if (sortBy === 'featured') {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    return a.title.localeCompare(b.title);
  });

  // Pagination calculations (20 items per page)
  const totalItems = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full max-w-full py-12 md:py-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-vortex-dark to-slate-950">
        <div className="absolute -top-40 -right-10 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-10 w-80 sm:w-96 h-80 sm:h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-4 py-1.5 rounded-full text-xs font-bold text-xbox-neon shadow-neon-green">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW GAMES ARRIVED! HOT DEALS AT VORTEX STORE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Premium Xbox Games <span className="text-transparent bg-clip-text bg-gradient-to-r from-xbox-neon to-emerald-400">At Lower Prices</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Looking for top-tier AAA games without paying full price? Grab these exclusive deals before prices change! 100% genuine Xbox accounts with instant digital delivery.
            </p>

            {/* Quick explanation pill */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-emerald-400 font-semibold flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" /> Sign Account
              </span>
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-cyan-400 font-semibold flex items-center gap-1">
                <HomeIcon className="w-3.5 h-3.5" /> Home Account
              </span>
              <span className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-amber-400 font-semibold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Full Account
              </span>
              <Link to="/how-it-works" className="text-purple-400 hover:text-purple-300 underline font-bold flex items-center gap-1 ml-2">
                <span>Account Types Guide</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Search Bar with explicit Search Button (not on keystroke) */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search games (Far Cry, Star Wars, Hellblade, Titanfall...)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-900/95 border border-slate-700 focus:border-xbox-neon text-white rounded-2xl py-3.5 pl-11 pr-28 text-sm outline-none transition-all shadow-xl placeholder:text-slate-500"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />

              <div className="absolute right-2 flex items-center gap-1.5">
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-xbox-green to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-neon-green transition-all hover:scale-105 active:scale-95"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Active search pill indicator */}
            {activeSearch && (
              <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-slate-300">
                <span>Active search: <strong className="text-xbox-neon">"{activeSearch}"</strong> ({totalItems} found)</span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 w-full max-w-full">
        
        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8 w-full max-w-full">
          
          {/* Account Type Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Account:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', labelMobile: 'All', labelDesktop: 'All Types' },
                  { id: 'HOME', labelMobile: 'Home 🏠', labelDesktop: 'Home 🏠 (Recommended)' },
                  { id: 'SIGN', labelMobile: 'Sign 🎮', labelDesktop: 'Sign 🎮 (Budget)' },
                  { id: 'FULL', labelMobile: 'Full 👑', labelDesktop: 'Full 👑 (Ownership)' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAccountTypeChange(t.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedAccountType === t.id
                        ? 'bg-emerald-600 text-black shadow-neon-green'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span className="sm:hidden">{t.labelMobile}</span>
                    <span className="hidden sm:inline">{t.labelDesktop}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs font-semibold text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-neon-purple'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat === 'All' ? 'All Games' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-6 w-full">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <Gamepad2 className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No matching games found</h3>
            <p className="text-xs text-slate-400 mb-4">Try searching with other keywords or reset your filters</p>
            <button
              onClick={() => {
                handleClearSearch();
                handleCategoryChange('All');
                handleAccountTypeChange('ALL');
              }}
              className="bg-emerald-600 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-6 w-full">
            {paginatedProducts.map((product) => (
              <GameCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setSelectedGameForModal(p)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls (20 games per page) */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 w-full">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Showing <span className="font-bold text-white">{startIndex + 1}</span>–
              <span className="font-bold text-white">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> of{' '}
              <span className="font-bold text-emerald-400">{totalItems}</span> games
              <span className="text-slate-500 ml-1.5">(20 per page)</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                type="button"
                disabled={validCurrentPage === 1}
                onClick={() => handlePageChange(validCurrentPage - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    validCurrentPage === pageNum
                      ? 'bg-emerald-600 text-black font-black shadow-neon-green'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next */}
              <button
                type="button"
                disabled={validCurrentPage === totalPages}
                onClick={() => handlePageChange(validCurrentPage + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {totalItems > 0 && totalPages === 1 && (
          <div className="mt-8 text-center text-xs text-slate-500 pt-4 border-t border-slate-800/60">
            Showing all {totalItems} game{totalItems > 1 ? 's' : ''} (Page 1 of 1 • 20 per page)
          </div>
        )}

        {/* Informative Banner */}
        <div className="mt-16 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-500/30 rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl w-full max-w-full">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-black text-white">Not sure about Sign vs Home vs Full Accounts?</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              We provide a complete guide explaining how each account type operates on Xbox Series X|S and Xbox One with quick 2-minute setup steps.
            </p>
          </div>
          <Link
            to="/how-it-works"
            className="w-full sm:w-auto text-center justify-center bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold px-6 py-3 rounded-xl text-xs shadow-neon-green flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <span>Read Account Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* Game Details Modal */}
      {selectedGameForModal && (
        <GameModal
          product={selectedGameForModal}
          onClose={() => setSelectedGameForModal(null)}
        />
      )}
    </div>
  );
}
