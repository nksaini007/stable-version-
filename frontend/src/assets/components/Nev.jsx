
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
        <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-2xl border-b border-gray-500/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] md:h-[64px]">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 z-10">
              <img src={logo} alt="Stinchar Logo" className="h-8 md:h-9 w-auto object-contain" />
              <span className="text-xl md:text-[22px] font-black text-white tracking-tight">
                Stin<span className="text-gray-400">char</span>
              </span>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-2xl p-1 border border-white/[0.06]">
                {navLinks.map((link, i) => {
                  const path = getPath(link);
                  return (
                    <NavLink
                      key={i}
                      to={path}
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-xl text-[12px] font-semibold tracking-wide transition-all duration-200 ${isActive
                          ? "bg-gray-500/15 text-gray-300 shadow-sm"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
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
            <div className="flex items-center gap-3 z-10">
              <Link
                to="/cart"
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400"
              >
                <ShoppingCart size={18} />
              </Link>

              {!user ? (
                <Link
                  to="/login"
                  className="hidden md:inline-flex px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-gray-500"
                >
                  Sign In
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
          className="w-10 h-10 rounded-xl bg-[#0d1117]/85 border border-white/10 flex items-center justify-center text-gray-300"
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
        className={`fixed inset-y-0 left-0 w-[280px] bg-[#0d1117] z-[200] transform transition-transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between p-5 border-b border-white/10">
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
        <div className="px-4 py-1 rounded-full bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 shadow-lg">
          <span className="text-sm font-black text-white tracking-wide">
            Stin<span className="text-gray-400">char</span>
          </span>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] md:hidden z-[100]">
        <div className="bg-[#0d1117]/85 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl ">
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