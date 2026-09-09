import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AccountBadge from '../components/AccountBadge';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount, totalCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-xl">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          You have not added any Xbox games to your cart yet. Explore our games catalog and pick your titles starting from 50 EGP!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-black font-extrabold px-6 py-3 rounded-xl text-xs shadow-neon-green transition-all"
        >
          <span>Explore Games Store</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">You have {totalCount} item(s) in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.product_id}_${item.account_type}`}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
            >
              {/* Item Info */}
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url}
                  alt={item.product_title}
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl bg-slate-950 border border-slate-800"
                />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">{item.product_title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <AccountBadge type={item.account_type} />
                    <span className="text-xs font-black text-xbox-neon">
                      {item.price} EGP
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.account_type, -1)}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.account_type, 1)}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right sm:text-left">
                  <span className="text-xs text-slate-400 block sm:hidden">Total:</span>
                  <span className="text-sm font-black text-white">
                    {item.price * item.quantity} EGP
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product_id, item.account_type)}
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/20 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add More Games</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 h-fit space-y-6">
          <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3">Order Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Items Total ({totalCount}):</span>
              <span className="font-bold text-white">{totalAmount} EGP</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Digital Delivery:</span>
              <span className="font-bold text-emerald-400">Free Instant Delivery ⚡</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-200">Total to Pay:</span>
              <span className="text-xl font-black text-xbox-neon">{totalAmount} EGP</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Warranty & Delivery</span>
            </div>
            <p>Transfer the amount via InstaPay or Mobile Wallet and upload your receipt in the next step.</p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-sm shadow-neon-green flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
