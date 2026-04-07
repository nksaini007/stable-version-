
import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Home,
  Store,
  Users,
  HardHat,
  Wrench,
  LogIn,
} from "lucide-react";
import logo from "../logo.png";
import { AuthContext } from "../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Nev = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    "Home",
    "Community",
    "project-plans",
    "Services",
    "Construction",
    "Contact",
  ];

  const adminlinks = ["users", "payments", "ordertraking", "query"];

  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin ? adminlinks : links;

  const getPath = (link) => {
    if (link === "Construction") return "/my-construction";
    if (isAdmin) {
      if (link === "ordertraking") return "/admin/orders";
      if (link === "query") return "/admin/support";
      return `/admin/${link.toLowerCase()}`;
    }
    return `/${link.toLowerCase()}`;
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="hidden md:block sticky top-0 w-full z-50">
        <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/10"></div>

        <div className="relative max-w-[1400px] mx-auto px-10">
          <div className="flex items-center justify-between h-[80px]">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 z-10 group">
              <div className="w-12 h-12 bg-white flex items-center justify-center -rotate-3 group-hover:rotate-0 group-hover:bg-cyan-400 transition-all duration-500">
                <span className="text-black font-black text-2xl tracking-tighter">STN</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-heading text-white tracking-[0.3em] leading-none">STINCHAR</span>
                <span className="text-[10px] font-bold text-cyan-400 tracking-[0.5em] mt-1">V_2.0</span>
              </div>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-8">
                {navLinks.map((link, i) => {
                  const path = getPath(link);
                  return (
                    <NavLink
                      key={i}
                      to={path}
                      className={({ isActive }) =>
                        `text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                          ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                          : "text-white/40 hover:text-white"
                        }`
                      }
                    >
                      {link}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-6 z-10 text-white font-black text-xs tracking-widest">
              <Link to="/cart" className="hover:text-cyan-400 transition-colors flex items-center gap-2 uppercase">
                <ShoppingCart size={18} />
                <span className="hidden xl:inline">STORE.CART</span>
              </Link>

              {!user ? (
                <Link
                  to="/login"
                  className="px-6 py-3 border border-white/20 hover:border-cyan-400 hover:text-cyan-400 transition-all text-[11px]"
                >
                  INITIALIZE_AUTH
                </Link>
              ) : (
                <ProfileDropdown user={user} logout={logout} />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU BUTTON */}
      <div className="md:hidden fixed top-4 left-4 z-[90]">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-10 h-10 rounded-xl bg-neutral-900/85 backdrop-blur-md border border-neutral-800 flex items-center justify-center text-gray-300"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MOBILE CART */}
      <div className="md:hidden fixed top-4 right-4 z-[90]">
        <Link
          to="/cart"
          className="w-10 h-10 rounded-xl bg-[#0d1117]/85 border border-white/10 flex items-center justify-center text-gray-300"
        >
          <ShoppingCart size={18} />
        </Link>
      </div>

      {/* MOBILE SIDE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[190]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-[280px] bg-neutral-900 z-[200] transform transition-transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between p-5 border-b border-neutral-800">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <img src={logo} alt="Stinchar Logo" className="h-7 w-auto object-contain" />
            <span className="text-xl font-black text-white">
              Stin<span className="text-gray-400">char</span>
            </span>
          </Link>

          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {navLinks.map((link, i) => {
            const path = getPath(link);
            return (
              <NavLink
                key={i}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-gray-400 hover:bg-white/10"
              >
                {link}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ================= FLOATING STINCHAR LOGO ================= */}
      <div className="md:hidden fixed bottom-[85px] left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
        <div className="px-4 py-1 rounded-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-lg">
          <span className="text-sm font-black text-white tracking-wide">
            Stin<span className="text-gray-400">char</span>
          </span>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] md:hidden z-[100]">
        <div className="bg-neutral-900/85 backdrop-blur-3xl border border-neutral-800 rounded-3xl shadow-2xl ">
          <div className="flex justify-between items-center px-3">

            {[
              { to: "/", icon: Home },
              { to: "/project-plans", icon: Store },
              { to: "/community", icon: Users },
              { to: "/my-construction", icon: HardHat },
              { to: "/services", icon: Wrench },
            ].map(({ to, icon: Icon }, i) => (
              <NavLink
                key={i}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-center w-[46px] h-[52px] rounded-2xl ${isActive ? "text-gray-300 bg-white/5" : "text-gray-400"
                  }`
                }
              >
                <Icon size={20} />
              </NavLink>
            ))}

            {user ? (
              <ProfileDropdown user={user} logout={logout} mobile />
            ) : (
              <NavLink
                to="/login"
                className="flex items-center justify-center w-[46px] h-[52px] text-gray-400"
              >
                <LogIn size={20} />
              </NavLink>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default Nev;