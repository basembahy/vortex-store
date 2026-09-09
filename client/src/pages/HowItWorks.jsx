import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home, Crown, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function HowItWorks() {
  const { settings } = useSettings();
  const whatsappHref = `https://wa.me/${(settings.whatsapp_number || '+201012345678').replace(/\D/g, '')}?text=${encodeURIComponent('Hello Vortex Store, I have a question about Xbox account types')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold px-3.5 py-1 rounded-full mb-3">
          <span>Complete Xbox Gamers Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Differences Between <span className="text-xbox-neon">Xbox</span> Account Types
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          At Vortex Store, we offer flexible options so you can play your favorite games at the lowest prices. Here is a clear breakdown of each account type to help you pick the best fit.
        </p>
      </div>

      {/* 3 Account Types Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        
        {/* 1. Sign Account */}
        <div className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 rounded-3xl p-6 relative flex flex-col justify-between transition-all hover:shadow-neon-green">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 shadow-sm">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-white">Sign Account</h3>
              <span className="text-[11px] font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                Most Economical 🎮
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Ideal for campaign and single-player games at the lowest cost.</p>

            <h4 className="text-xs font-bold text-slate-200 mb-2">How it works:</h4>
            <ul className="text-xs text-slate-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Sign into the provided profile on your console to launch and play the game.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Experience the full game campaign without paying full retail store prices.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Requires internet connection while playing on your console.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold text-center">
            Best for budget-conscious gamers and campaign playthroughs
          </div>
        </div>

        {/* 2. Home Account */}
        <div className="bg-slate-900/90 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-3xl p-6 relative flex flex-col justify-between transition-all hover:shadow-neon-cyan scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-black font-extrabold text-[11px] px-3.5 py-0.5 rounded-full shadow-lg">
            MOST POPULAR CHOICE ⭐
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4 shadow-sm">
              <Home className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-white">Home Account</h3>
              <span className="text-[11px] font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                Recommended 🏠
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">The preferred and most seamless option for the majority of Xbox players.</p>

            <h4 className="text-xs font-bold text-slate-200 mb-2">Key Features:</h4>
            <ul className="text-xs text-slate-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Set as <strong>My Home Xbox</strong> on your console once.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Play directly from your <strong>own personal gamertag</strong> with all your achievements and saves!</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Play online multiplayer and offline without interruptions.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px] text-cyan-300 font-semibold text-center">
            Play from your main profile and keep all Gamerscore & achievements
          </div>
        </div>

        {/* 3. Full Account */}
        <div className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500 rounded-3xl p-6 relative flex flex-col justify-between transition-all hover:shadow-lg">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4 shadow-sm">
              <Crown className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-white">Full Account</h3>
              <span className="text-[11px] font-bold bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-500/40">
                Exclusive 👑
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Complete, exclusive ownership of the account solely for you forever.</p>

            <h4 className="text-xs font-bold text-slate-200 mb-2">Key Features:</h4>
            <ul className="text-xs text-slate-300 space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Receive the full original email and password.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Change password, update email, and attach your personal 2-step verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>The game account belongs permanently and exclusively to you.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px] text-amber-400 font-semibold text-center">
            For gamers seeking 100% full account ownership and control
          </div>
        </div>

      </div>

      {/* Step by Step Activation Guide */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-12">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <span>How to Activate Home Xbox (Step-by-Step)</span>
          <span className="text-xs font-normal text-slate-400">(Quick 2-minute setup)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-xbox-neon font-black text-xs flex items-center justify-center">1</span>
            <h4 className="font-bold text-white text-xs">Add Account to Console</h4>
            <p className="text-[11px] text-slate-400">
              Press the Xbox button on your controller, go to Profile & system ➔ Add or switch ➔ Add new, and enter the credentials provided.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-xbox-neon font-black text-xs flex items-center justify-center">2</span>
            <h4 className="font-bold text-white text-xs">Enable Home Xbox</h4>
            <p className="text-[11px] text-slate-400">
              Navigate to Settings ➔ General ➔ Personalization ➔ My home Xbox ➔ Select "Make this my home Xbox".
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-xbox-neon font-black text-xs flex items-center justify-center">3</span>
            <h4 className="font-bold text-white text-xs">Download the Game</h4>
            <p className="text-[11px] text-slate-400">
              Open My games & apps ➔ Full library ➔ Owned games, and start installing the game to your console.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-xbox-neon font-black text-xs flex items-center justify-center">4</span>
            <h4 className="font-bold text-white text-xs">Switch & Enjoy!</h4>
            <p className="text-[11px] text-slate-400">
              Switch back to your personal main gamertag and launch the game. All achievements and progress save directly to your own profile!
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 mb-12">
        <h2 className="text-xl font-black text-white mb-6">Frequently Asked Questions (FAQ)</h2>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="font-bold text-white text-sm mb-1">Are the accounts genuine and guaranteed?</h4>
            <p className="text-slate-300 leading-relaxed">
              Yes, 100%! All Vortex Store accounts are legitimately purchased through the official Microsoft Xbox Store without any fraudulent cards. We provide full warranty and lifetime legitimacy.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="font-bold text-white text-sm mb-1">Is there any risk of console ban?</h4>
            <p className="text-slate-300 leading-relaxed">
              Never! Sharing games via the Home Xbox feature is an official, built-in feature designed by Microsoft for all Xbox consoles. It carries zero risk to your hardware or personal account.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="font-bold text-white text-sm mb-1">How fast do I receive account credentials?</h4>
            <p className="text-slate-300 leading-relaxed">
              Orders are typically fulfilled within minutes after verifying your transfer receipt. The credentials appear directly in your "My Orders" and "Track Order" pages.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-black text-white">Ready to start playing?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Explore our extensive catalog and pick your favorite Xbox games with instant delivery!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/"
            className="bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold px-6 py-3 rounded-xl text-xs shadow-neon-green flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Browse Games Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Chat via WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
