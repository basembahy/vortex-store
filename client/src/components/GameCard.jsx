import React, { useState } from 'react';
import { ShoppingCart, Eye, Gamepad2, Home, Crown, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function GameCard({ product, onOpenDetails }) {
  const { addToCart } = useCart();
  const [selectedType, setSelectedType] = useState(() => {
    if (product.is_available_home && product.price_home != null) return 'HOME';
    if (product.is_available_sign && product.price_sign != null) return 'SIGN';
    if (product.is_available_full && product.price_full != null) return 'FULL';
    return 'HOME';
  });
  const [justAdded, setJustAdded] = useState(false);

  // Available options
  const options = [];
  if (product.is_available_sign && product.price_sign != null) {
    options.push({ type: 'SIGN', label: 'Sign', price: product.price_sign, icon: Gamepad2 });
  }
  if (product.is_available_home && product.price_home != null) {
    options.push({ type: 'HOME', label: 'Home', price: product.price_home, icon: Home });
  }
  if (product.is_available_full && product.price_full != null) {
    options.push({ type: 'FULL', label: 'Full', price: product.price_full, icon: Crown });
  }

  // Get current active price
  const currentOption = options.find((o) => o.type === selectedType) || options[0];
  const currentPrice = currentOption ? currentOption.price : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!currentPrice || !currentOption) return;
    addToCart(product, currentOption.type, currentPrice);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-neon-green flex flex-col cursor-pointer"
    >
      {/* Featured ribbon */}
      {product.featured && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
          <span>FEATURED</span>
          <span>🔥</span>
        </div>
      )}

      {/* Game Poster Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        {/* Category tag */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
          <span className="bg-black/80 backdrop-blur text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {product.category || 'Xbox'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails && onOpenDetails(product);
            }}
            className="w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Game Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-xbox-neon transition-colors" title={product.title}>
            {product.title}
          </h3>
        </div>

        {/* Account Types & Prices Selector */}
        <div className="mt-3">
          <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Account Type:</span>
            {currentPrice && (
              <span className="font-bold text-white text-xs">
                Price: <strong className="text-xbox-neon text-sm">{currentPrice}</strong> EGP
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            {['SIGN', 'HOME', 'FULL'].map((type) => {
              const opt = options.find((o) => o.type === type);
              const isSelected = selectedType === type && opt;
              const isAvailable = Boolean(opt);

              let badgeColor = 'text-slate-400';
              if (type === 'SIGN') badgeColor = 'text-emerald-400';
              if (type === 'HOME') badgeColor = 'text-cyan-400';
              if (type === 'FULL') badgeColor = 'text-amber-400';

              return (
                <button
                  key={type}
                  type="button"
                  disabled={!isAvailable}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAvailable) setSelectedType(type);
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-xs transition-all ${
                    !isAvailable
                      ? 'opacity-30 cursor-not-allowed bg-transparent'
                      : isSelected
                      ? 'bg-slate-800 border border-emerald-500/80 shadow-sm'
                      : 'hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${badgeColor}`}>
                    {type === 'SIGN' ? 'Sign 🎮' : type === 'HOME' ? 'Home 🏠' : 'Full 👑'}
                  </span>
                  <span className="text-[11px] font-extrabold text-white mt-0.5">
                    {isAvailable ? `${opt.price} EGP` : 'N/A'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!currentPrice}
          className={`mt-4 w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
            justAdded
              ? 'bg-emerald-500 text-black shadow-neon-green'
              : !currentPrice
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-black hover:shadow-neon-green'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart ({currentOption?.label} - {currentPrice} EGP)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
