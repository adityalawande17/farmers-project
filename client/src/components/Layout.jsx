import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⊞", exact: true },
  { to: "/chat", label: "AI Assistant", badge: "AI" },
  { to: "/disease", label: "Disease Detector", badge: "AI" },
  { to: "/prices", label: "Mandi Prices", icon: "₹" },
  { to: "/weather", label: "Weather Advisor", badge: "AI" },
  { to: "/add-crop", label: "Add Crop", icon: "+" },
];

// SVG icons for the mobile bottom nav (Heroicons outline style)
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const ScanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const PricesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);
const WeatherIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 110-14 5.5 5.5 0 015.3 7H17.5a3.5 3.5 0 010 7z" />
  </svg>
);

const BOTTOM_NAV = [
  { to: "/", label: "Home",    exact: true, Icon: HomeIcon },
  { to: "/chat",    label: "Chat",    Icon: ChatIcon },
  { to: "/disease", label: "Scan",    Icon: ScanIcon },
  { to: "/prices",  label: "Prices",  Icon: PricesIcon },
  { to: "/weather", label: "Weather", Icon: WeatherIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 py-6 px-4 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-green-500 rounded-tl-full rounded-tr-full rounded-br-full flex items-center justify-center text-white text-sm">
            🌿
          </div>
          <span className="font-serif text-xl text-green-700 font-medium">
            FarmSense AI
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ to, label, icon, badge, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
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
            onClick={handleLogout}
            className="w-full text-xs text-gray-400 hover:text-red-500 text-left px-3 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content — extra bottom padding on mobile so content clears the bottom nav */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex">
        {BOTTOM_NAV.map(({ to, label, exact, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                isActive ? "text-green-600" : "text-gray-400"
              }`
            }
          >
            <Icon />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
