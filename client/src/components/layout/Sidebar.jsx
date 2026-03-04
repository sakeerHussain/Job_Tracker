import { Link, useLocation } from "react-router-dom";
import { Briefcase, LayoutDashboard, Kanban, BarChart2, FileText, LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";

const navItems = [
  { path: "/",             label: "Dashboard",   icon: LayoutDashboard },
  { path: "/kanban",       label: "Kanban Board", icon: Kanban },
  { path: "/analytics",    label: "Analytics",    icon: BarChart2 },
  { path: "/cover-letter", label: "Cover Letter", icon: FileText },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Briefcase className="text-white" size={20} />
        </div>
        <span className="text-lg font-bold text-gray-800">JobTracker</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;