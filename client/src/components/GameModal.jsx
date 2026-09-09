import React, { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function GameModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedType, setSelectedType] = useState(() => {
    if (product.is_available_home && product.price_home != null) return 'HOME';
    if (product.is_available_sign && product.price_sign != null) return 'SIGN';
    if (product.is_available_full && product.price_full != null) return 'FULL';
    return 'HOME';
  });
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const options = [];
  if (product.is_available_sign && product.price_sign != null) {
    options.push({
      type: 'SIGN',
      title: 'Sign Account (Sign-In Mode)',
      desc: 'Sign into the provided account on your console to launch and play the game. Most economical option, perfect for completing campaigns!',
      price: product.price_sign,
      badge: 'Budget Friendly 🎮'
    });
  }
  if (product.is_available_home && product.price_home != null) {
    options.push({
      type: 'HOME',
      title: 'Home Account (My Home Xbox)',
      desc: 'Most popular! Set the account as "My Home Xbox" on your console once. Play from your own personal profile with all achievements and online multiplayer.',
      price: product.price_home,
      badge: 'Most Popular 🏠'
    });
  }
  if (product.is_available_full && product.price_full != null) {
    options.push({
      type: 'FULL',
      title: 'Full Account (Complete Ownership)',
      desc: 'Exclusive full ownership! You receive full access credentials and can change the email, password, and add your own phone security.',
      price: product.price_full,
      badge: 'Exclusive Ownership 👑'
    });
  }

  const currentOption = options.find((o) => o.type === selectedType) || options[0];

  const handleAddToCart = () => {
    if (!currentOption) return;
    addToCart(product, currentOption.type, currentOption.price);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Cover Art Image */}
          <div className="relative aspect-[3/4] md:aspect-auto h-64 md:h-full bg-slate-950">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 md:bg-gradient-to-r md:from-transparent md:to-slate-900" />
            <div className="absolute bottom-3 left-3">
              <span className="bg-emerald-950/80 border border-emerald-500/50 text-xbox-neon text-xs px-2.5 py-1 rounded-lg font-bold">
                {product.category || 'Xbox'}
              </span>
            </div>
          </div>

          {/* Details & Options */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black text-white mb-2">{product.title}</h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                {product.description || 'Authentic Xbox game account with full warranty and fast delivery.'}
              </p>

              <h4 className="text-xs font-bold text-slate-300 mb-2">Select Account Type:</h4>

              {/* Options list */}
              <div className="space-y-2 mb-4">
                {options.map((opt) => {
                  const isSelected = selectedType === opt.type;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setSelectedType(opt.type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="account_choice"
                            checked={isSelected}
                            onChange={() => setSelectedType(opt.type)}
                            className="text-xbox-neon focus:ring-xbox-neon"
                          />
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                        </div>
                        <span className="text-xs font-black text-xbox-neon bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          {opt.price} EGP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 pl-5 leading-tight">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-base font-black text-xbox-neon">
                  {currentOption ? `${currentOption.price} EGP` : 'Please Select'}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!currentOption}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  justAdded
                    ? 'bg-emerald-500 text-black shadow-neon-green'
                    : 'bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-black shadow-neon-green'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart Successfully!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart & Checkout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
