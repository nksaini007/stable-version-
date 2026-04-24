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
  HatGlasses,
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
    "Project-Plans",
    "Services",
    "Construction",
    "Contact",
  ];

  const adminlinks = ["Users", "Payments", "OrderTracking", "Query"];

  const isAdmin = user?.role === "admin";
  const navLinks = isAdmin ? adminlinks : links;

  const getPath = (link) => {
    if (link === "Construction") return "/my-construction";
    if (link === "Project-Plans") return "/project-plans";
    if (isAdmin) {
      if (link === "OrderTracking") return "/admin/orders";
      if (link === "Query") return "/admin/support";
      return `/admin/${link.toLowerCase()}`;
    }
    return `/${link.toLowerCase()}`;
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
          .nav-theme {
            font-family: 'Outfit', sans-serif !important;
          }
        `}
      </style>

      {/* ================= DESKTOP NAVBAR ================= */}
      <div className="hidden md:block relative w-full z-50 bg-white border-b border-zinc-100 nav-theme">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[70px]">

          {/* LOGO BOX */}
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <img
              src={logo}
              alt="STINCHAR"
              className="h-9 w-auto drop-shadow-sm rounded-lg"
            />
            <span className="text-zinc-900 font-semibold tracking-tight text-lg">Stinchar</span>
          </Link>

          {/* LINKS GRID */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, i) => {
              const path = getPath(link);
              return (
                <NavLink
                  key={i}
                  to={path}
                  className={({ isActive }) =>
                    `text-[13px] font-medium tracking-wide transition-all duration-300 relative ${isActive
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.replace("-", " ")}
                      {isActive && (
                        <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full"></span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6">
            <Link to="/cart" className="relative text-zinc-600 hover:text-zinc-900 transition-colors p-2 hover:bg-zinc-50 rounded-full">
              <ShoppingCart size={10} strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-zinc-900 rounded-full border border-white"></span>
            </Link>

            {!user ? (
              <Link
                to="/login"
                className="flex items-center px-6 py-2.5 bg-zinc-900 text-white font-medium text-[13px] rounded-full hover:bg-black transition-all shadow-sm active:scale-95"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex items-center">
                <ProfileDropdown user={user} logout={logout} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden relative w-full h-[60px] bg-white border-b border-zinc-100 z-[100] flex items-center justify-between px-5 nav-theme">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="STINCHAR"
            className="w-8 h-8 rounded-md"
          />
          <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Stinchar</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="text-zinc-600 p-2 hover:bg-zinc-50 rounded-full relative">
            <ShoppingCart size={20} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-900 rounded-full border border-white"></span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-full"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* MOBILE SIDE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/40 z-[190] backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 w-[80%] max-w-[300px] bg-white z-[200] transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden flex flex-col shadow-2xl nav-theme ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-100">
          <span className="font-medium text-lg tracking-tight text-zinc-900">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navLinks.map((link, i) => {
            const path = getPath(link);
            return (
              <NavLink
                key={i}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3.5 mb-1 rounded-xl text-[14px] font-medium tracking-wide transition-all ${isActive
                    ? "bg-zinc-50 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50/50 hover:text-zinc-900"
                  }`
                }
              >
                {link.replace("-", " ")}
              </NavLink>
            );
          })}
        </div>

        <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
          {!user && (
            <Link
              to="/login"
              className="w-full flex items-center justify-center py-3 bg-zinc-900 text-white font-medium text-[13px] rounded-xl hover:bg-black transition-all shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="fixed bottom-0 left-0 w-full md:hidden z-[100] bg-white/90 backdrop-blur-md border-t border-zinc-200/80 nav-theme pb-safe">
        <div className="flex justify-between items-stretch h-[65px] px-1">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/project-plans", icon: Store, label: "Plans" },
            { to: "/community", icon: Users, label: "Social" },
            { to: "/my-construction", icon: HardHat, label: "Build" },
            { to: "/services", icon: HatGlasses, label: "Services" },
          ].map(({ to, icon: Icon, label }, i) => (
            <NavLink
              key={i}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 transition-all ${isActive
                  ? "text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={12} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="flex-1 flex items-center justify-center">
            {user ? (
              <ProfileDropdown user={user} logout={logout} mobile />
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex-1 flex flex-col w-full h-full items-center justify-center gap-1 transition-all ${isActive
                    ? "text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <LogIn size={10} strokeWidth={isActive ? 2 : 1.5} />
                    <span className="text-[10px] font-medium tracking-wide">Login</span>
                  </>
                )}
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Nev;