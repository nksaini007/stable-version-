import React from "react";
import { Link } from "react-router-dom";

/**
 * NotFound404
 * - Single-purpose "Page not found" UI
 * - Compact, centered, accessible
 * - Modern micro-animations and subtle neon accent
 * - Tailwind CSS required
 */

const NotFound404 = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Subtle decorative neon blobs */}
        <div className="absolute -top-40 -left-40 w-72 h-72 rounded-full bg-gradient-to-tr from-pink-600 to-violet-600 opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-12 w-60 h-60 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-14 blur-2xl" />
      </div>

      <section
        role="region"
        aria-labelledby="nf-heading"
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10 text-center">
            {/* Stylized numeric */}
            <div className="mx-auto flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 ring-4 ring-rose-500/20 shadow-lg transform transition-transform hover:scale-105">
              <span className="text-4xl font-extrabold text-white tracking-tight select-none">404</span>
            </div>

            <h1 id="nf-heading" className="mt-6 text-2xl sm:text-3xl font-bold text-white">
              Page not found
            </h1>

            <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg mx-auto">
              The page you’re trying to reach doesn’t exist or has been moved.
              Check the link or go back home.
            </p>

            {/* Primary CTA */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-400 text-black font-semibold shadow-md hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 transition"
              >
                Go to Home
              </Link>

              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.history.back(); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition"
              >
                Go Back
              </a>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              If you typed the address manually, double-check the spelling.
            </p>
          </div>

          {/* subtle footer */}
          <div className="border-t border-zinc-800 px-6 py-3 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} YourBrand
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFound404;
