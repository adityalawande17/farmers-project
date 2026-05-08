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

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
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
            <div className="text-sm font-medium text-green-800">
              {user?.name}
            </div>
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
