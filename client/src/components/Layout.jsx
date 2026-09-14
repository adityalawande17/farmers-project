import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⊞", exact: true },
  { to: "/chat", label: "AI Assistant", badge: "AI" },
  { to: "/advisor", label: "Planting Advisor", badge: "AI" },
  { to: "/disease", label: "Disease Detector", badge: "AI" },
  { to: "/prices", label: "Mandi Prices", icon: "₹" },
  { to: "/weather", label: "Weather Advisor", badge: "AI" },
  { to: "/add-crop", label: "Add Crop", icon: "+" },
];

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-green-500 rounded-tl-full rounded-tr-full rounded-br-full flex items-center justify-center text-white text-sm">
      🌿
    </div>
    <span className="font-serif text-xl text-green-700 font-medium">
      FarmSense AI
    </span>
  </div>
);

// Shared nav list — used by both the desktop sidebar and the mobile drawer,
// so the two never drift out of sync with each other again.
const NavList = ({ onNavigate }) => (
  <nav className="flex flex-col gap-1 flex-1">
    {navItems.map(({ to, label, icon, badge, exact }) => (
      <NavLink
        key={to}
        to={to}
        end={exact}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-green-50 text-green-800 font-medium"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`
        }
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </NavLink>
    ))}
  </nav>
);

const UserPanel = ({ user, onLogout }) => (
  <div className="mt-auto">
    <div className="bg-green-50 rounded-xl p-3 mb-3">
      <div className="text-sm font-medium text-green-800">{user?.name}</div>
      <div className="text-xs text-gray-500 mt-0.5">
        {user?.location?.district}, {user?.location?.state}
      </div>
      {user?.farmSize && (
        <div className="text-xs text-gray-400">{user.farmSize} acres</div>
      )}
    </div>
    <button
      onClick={onLogout}
      className="w-full text-xs text-gray-400 hover:text-red-500 text-left px-3 py-2 transition-colors"
    >
      Sign out
    </button>
  </div>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close the mobile drawer whenever the route changes (covers the normal
  // nav-link-click case too, but also back/forward navigation etc.)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close on Escape while open
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && setSidebarOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 py-6 px-4 shrink-0">
        <div className="mb-8">
          <Logo />
        </div>
        <NavList />
        <UserPanel user={user} onLogout={handleLogout} />
      </aside>

      {/* Top bar — mobile only */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-30 flex items-center justify-between px-4">
        <Logo />
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="text-gray-500 hover:text-gray-800 p-1"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Backdrop — mobile only, sits behind the drawer, fades with it */}
      <div
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — mobile only, same nav content as the desktop sidebar */}
      <aside
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[80%] bg-white z-50 flex flex-col py-6 px-4 shadow-xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <CloseIcon />
          </button>
        </div>
        <NavList onNavigate={() => setSidebarOpen(false)} />
        <UserPanel user={user} onLogout={handleLogout} />
      </aside>

      {/* Main content — top padding on mobile clears the fixed top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <Outlet />
      </main>

    </div>
  );
}
