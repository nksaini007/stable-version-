// import React, { useContext, useState } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { ShoppingCart, Menu, X, Home, Store, Users, HardHat, Wrench, LogIn } from "lucide-react";
// import { AuthContext } from "../context/AuthContext";
// import ProfileDropdown from "./ProfileDropdown";

// const Nev = () => {
//   const { user, logout } = useContext(AuthContext);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const links = ["Home", "Community", "project-plans", "Services", "Construction", "Contact"];
//   const adminlinks = ["users", "payments", "ordertraking", "query"];
//   const isAdmin = user?.role === "admin";
//   const navLinks = isAdmin ? adminlinks : links;

//   const getPath = (link) => {
//     if (link === "Construction") return "/my-construction";
//     return `/${link.toLowerCase()}`;
//   };

//   return (
//     <>
//       {/* ═══════ MAIN NAVBAR ═══════ */}
//       <nav className="hidden md:block sticky top-0 w-full z-50">
//         <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-2xl border-b border-gray-500/10"></div>

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-[60px] md:h-[64px]">

//             {/* ── LOGO ── */}
//             <Link to="/" className="flex items-center gap-2.5 group z-10">
//               {/* <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-gray-400 to-teal-500 flex items-center justify-center shadow-lg shadow-gray-500/25 group-hover:shadow-gray-500/40 transition-shadow duration-300 group-hover:scale-105 transform">
//                 <span className="text-white font-black text-sm md:text-base">S</span>
//               </div> */}
//               <span className="text-xl md:text-[22px] font-black text-white tracking-tight">
//                 Stin<span className="text-gray-400">char</span>
//               </span>
//             </Link>

//             {/* ── DESKTOP NAV LINKS ── */}
//             <div className="hidden lg:flex items-center">
//               <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-2xl p-1 border border-white/[0.06]">
//                 {navLinks.map((link, i) => {
//                   const path = getPath(link);
//                   return (
//                     <NavLink
//                       key={i}
//                       to={path}
//                       className={({ isActive }) =>
//                         `px-4 py-2 rounded-xl text-[12px] font-semibold tracking-wide transition-all duration-200 ${isActive
//                           ? "bg-gray-500/15 text-gray-300 shadow-sm"
//                           : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
//                         }`
//                       }
//                     >
//                       {link}
//                     </NavLink>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ── RIGHT ACTIONS ── */}
//             <div className="flex items-center gap-2 md:gap-3 z-10">
//               <Link
//                 to="/cart"
//                 aria-label="Cart"
//                 className="relative w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-gray-400 hover:border-gray-500/30 hover:bg-gray-500/10 transition-all"
//               >
//                 <ShoppingCart size={18} />
//               </Link>

//               {!user ? (
//                 <Link
//                   to="/login"
//                   className="hidden md:inline-flex px-5 py-2.5 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-400 hover:to-gray-400 transition-all shadow-lg shadow-gray-500/20"
//                 >
//                   Sign In
//                 </Link>
//               ) : (
//                 <div className="hidden md:block">
//                   <ProfileDropdown user={user} logout={logout} />
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>

//         {/* ═══════ MOBILE FLOATING HEADER BUTTONS ═══════ */}
//         <div className="md:hidden fixed top-4 left-4 z-[90]">
//           <button
//             onClick={() => setMobileMenuOpen(true)}
//             className="w-10 h-10 rounded-xl bg-[#0d1117]/85 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-300 shadow-lg active:scale-95 transition-all"
//           >
//             <Menu size={20} />
//           </button>
//         </div>

//         <div className="md:hidden fixed top-4 right-4 z-[90]">
//           <Link
//             to="/cart"
//             className="w-10 h-10 rounded-xl bg-[#0d1117]/85 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-300 hover:text-gray-400 shadow-lg active:scale-95 transition-all"
//           >
//             <ShoppingCart size={18} />
//           </Link>
//         </div>

//         {/* ═══════ MOBILE SIDE DRAWER ═══════ */}
//         {/* Backdrop */}
//         {mobileMenuOpen && (
//           <div
//             className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] transition-opacity duration-300"
//             onClick={() => setMobileMenuOpen(false)}
//           />
//         )}

//         {/* Drawer */}
//         <div
//           className={`md:hidden fixed inset-y-0 left-0 w-[280px] bg-[#0d1117]/95 backdrop-blur-3xl border-r border-gray-500/10 shadow-2xl z-[200] transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
//             }`}
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
//             <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-400 to-teal-500 flex items-center justify-center shadow-lg shadow-gray-500/25">
//                 <span className="text-white font-black text-sm">S</span>
//               </div>
//               <span className="text-xl font-black text-white tracking-tight">
//                 Stin<span className="text-gray-400">char</span>
//               </span>
//             </Link>
//             <button
//               onClick={() => setMobileMenuOpen(false)}
//               className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           {/* Links */}
//           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
//             {navLinks.map((link, i) => {
//               const path = getPath(link);
//               return (
//                 <NavLink
//                   key={i}
//                   to={path}
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={({ isActive }) =>
//                     `block px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${isActive
//                       ? "bg-gray-500/15 text-gray-400 shadow-sm"
//                       : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
//                     }`
//                   }
//                 >
//                   {link}
//                 </NavLink>
//               );
//             })}
//           </div>

//           {/* Footer */}
//           <div className="p-5 border-t border-white/10 bg-white/[0.02]">
//             {!user ? (
//               <Link
//                 to="/login"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="flex w-full items-center justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-500 to-teal-500 shadow-lg shadow-gray-500/20 active:scale-95 transition-all"
//               >
//                 Sign In
//               </Link>
//             ) : (
//               <div className="flex flex-col gap-4">
//                 <div className="flex items-center gap-3 w-full">
//                   <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-500/50 shrink-0">
//                     {user.profileImage ? (
//                       <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-gray-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
//                         {user.name?.charAt(0).toUpperCase()}
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-white truncate">{user.name}</p>
//                     <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2.5">
//                   <Link
//                     to="/profile"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="flex-1 text-center py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-[13px] font-semibold text-gray-400 hover:bg-gray-500/20 active:scale-95 transition-all"
//                   >
//                     Profile
//                   </Link>
//                   <button
//                     onClick={() => {
//                       logout();
//                       setMobileMenuOpen(false);
//                     }}
//                     className="flex-1 text-center py-2.5 rounded-xl bg-gray-500/10 border border-gray-500/20 text-[13px] font-semibold text-gray-400 hover:bg-gray-500/20 active:scale-95 transition-all"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* ═══════ MOBILE BOTTOM TAB BAR (FLOATING DOCK) ═══════ */}
//       <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] md:hidden z-[100] transition-all duration-300">
//         <div className="bg-[#0d1117]/85 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-gray-500/10 p-1">
//           <div className="flex justify-between items-center px-1">
//             {[
//               { to: "/", icon: Home, label: "Home" },
//               { to: "/project-plans", icon: Store, label: "Shop" },
//               { to: "/community", icon: Users, label: "Social" },
//               { to: "/my-construction", icon: HardHat, label: "Build" },
//               { to: "/services", icon: Wrench, label: "Services" },
//             ].map(({ to, icon: Icon, label }) => (
//               <NavLink
//                 key={label}
//                 to={to}
//                 className={({ isActive }) =>
//                   `flex flex-col items-center justify-center gap-1 w-[46px] h-[52px] rounded-2xl transition-all duration-300 ${isActive
//                     ? "text-gray-400 bg-white/5 shadow-inner"
//                     : "text-gray-400 hover:text-gray-200 active:scale-95 hover:bg-white/5"
//                   }`
//                 }
//               >
//                 {({ isActive }) => (
//                   <>
//                     <div className="relative flex items-center justify-center">
//                       <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`} />
//                       {isActive && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>}
//                     </div>
//                   </>
//                 )}
//               </NavLink>
//             ))}

//             {user ? (
//               <div className="flex flex-col items-center justify-center w-[46px] h-[52px] rounded-2xl hover:bg-white/5 transition-all">
//                 <ProfileDropdown user={user} logout={logout} mobile={true} />
//               </div>
//             ) : (
//               <NavLink
//                 to="/login"
//                 className="flex flex-col items-center justify-center w-[46px] h-[52px] rounded-2xl text-gray-400 hover:text-gray-200 active:scale-95 hover:bg-white/5 transition-all duration-300"
//               >
//                 <LogIn size={20} strokeWidth={2} />
//               </NavLink>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Nev;
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
                        `px-4 py-2 rounded-xl text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                          isActive
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
        className={`fixed inset-y-0 left-0 w-[280px] bg-[#0d1117] z-[200] transform transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between p-5 border-b border-white/10">
          <span className="text-xl font-black text-white">
            Stin<span className="text-gray-400">char</span>
          </span>

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
                  `flex items-center justify-center w-[46px] h-[52px] rounded-2xl ${
                    isActive ? "text-gray-300 bg-white/5" : "text-gray-400"
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