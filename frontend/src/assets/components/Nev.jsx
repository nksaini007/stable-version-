
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
      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-[#e5e5e5] border-b-4 border-black hidden md:block">
        <div className="relative max-w-[1600px] mx-auto flex items-stretch h-[72px]">

          {/* LOGO BOX */}
          <Link to="/" className="flex items-center px-8 border-r-4 border-black bg-black text-white hover:bg-[#ff5c00] transition-colors group">
            <span className="text-3xl font-heading tracking-tighter">STN.</span>
          </Link>

          {/* LINKS GRID */}
          <div className="flex-1 flex">
             {navLinks.map((link, i) => {
               const path = getPath(link);
               return (
                 <NavLink
                   key={i}
                   to={path}
                   className={({ isActive }) =>
                     `flex items-center px-6 xl:px-8 border-r-4 border-black text-[12px] font-black uppercase tracking-widest transition-all ${isActive
                       ? "bg-black text-white"
                       : "hover:bg-black/5 text-black"
                     }`
                   }
                 >
                   {link}
                 </NavLink>
               );
             })}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-stretch border-l-4 border-black ml-auto">
            <Link to="/cart" className="flex items-center px-8 border-r-4 border-black hover:bg-black hover:text-white transition-all group relative">
              <ShoppingCart size={22} />
              <span className="absolute top-2 right-4 text-[10px] font-bold">🛒</span>
            </Link>

            {!user ? (
               <Link
                 to="/login"
                 className="flex items-center px-10 bg-[#ff5c00] text-black font-black text-sm uppercase hover:bg-black hover:text-white transition-all"
               >
                 _AUTH_INITIALIZE
               </Link>
            ) : (
               <div className="flex items-center px-6">
                 <ProfileDropdown user={user} logout={logout} />
               </div>
            )}
          </div>

        </div>
      </nav>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden fixed top-0 w-full h-[64px] bg-[#e5e5e5] border-b-4 border-black z-[100] flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
           <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-heading text-xl">STN</div>
           <span className="text-xs font-black tracking-widest uppercase">STINCHAR_V2</span>
        </Link>
        <div className="flex items-center gap-4">
           <Link to="/cart" className="text-black p-2 border-2 border-black">
              <ShoppingCart size={20} />
           </Link>
           <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-black text-white border-2 border-black"
           >
              <Menu size={24} />
           </button>
        </div>
      </div>

      {/* MOBILE SIDE DRAWER */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[190] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-[#e5e5e5] border-l-4 border-black z-[200] transform transition-transform duration-500 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b-4 border-black bg-black text-white">
          <span className="font-heading text-xl tracking-tighter">STN.MENU</span>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X size={28} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {navLinks.map((link, i) => {
            const path = getPath(link);
            return (
              <NavLink
                key={i}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `block px-6 py-5 border-4 border-black font-black uppercase text-sm tracking-widest transition-all ${isActive ? "bg-black text-white translate-x-2" : "hover:bg-[#ff5c00]"}`
                }
              >
                {link}._
              </NavLink>
            );
          })}
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-black text-white">
           <span className="text-[10px] font-mono opacity-50 uppercase tracking-[0.3em]">
             Ref_system_stinchar_v2.0.4
           </span>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="fixed bottom-0 left-0 w-full md:hidden z-[100] bg-[#e5e5e5] border-t-4 border-black">
          <div className="flex justify-between items-stretch">

            {[
              { to: "/", icon: Home, label: "INIT" },
              { to: "/project-plans", icon: Store, label: "PLAN" },
              { to: "/community", icon: Users, label: "COMM" },
              { to: "/my-construction", icon: HardHat, label: "HARD" },
            ].map(({ to, icon: Icon, label }, i) => (
              <NavLink
                key={i}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center h-[68px] border-r-2 border-black/10 transition-all ${isActive ? "bg-black text-[#ff5c00]" : "text-black hover:bg-black/5"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[8px] font-black mt-1 tracking-tighter">{label}</span>
              </NavLink>
            ))}

            <div className="flex-1 flex items-center justify-center bg-black">
               {user ? (
                 <ProfileDropdown user={user} logout={logout} mobile />
               ) : (
                <NavLink
                  to="/login"
                  className="flex flex-col items-center justify-center w-full h-full bg-[#ff5c00] text-black border-l-2 border-black"
                >
                  <LogIn size={20} />
                  <span className="text-[8px] font-black mt-1">AUTH</span>
                </NavLink>
               )}
            </div>

          </div>
      </div>
    </>
  );
};

export default Nev;