import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  Palette,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

const SideBar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Campaign",
      path: "/campaign",
      icon: Megaphone,
    },
    {
      name: "Studio",
      path: "/studio",
      icon: Palette,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div
      className={`h-[calc(100vh-57px)] border-r border-gray-800/50 flex flex-col transition-all duration-300 flex-shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                active
                  ? "bg-[#1B9C5B]/10 text-[#1B9C5B]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {/* Active Indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#1B9C5B] rounded-r-full" />
              )}

              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  active
                    ? "text-[#1B9C5B]"
                    : "text-gray-400 group-hover:text-gray-200"
                }`}
              />

              {!isCollapsed && (
                <span className="font-medium text-[13px]">{item.name}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs text-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-gray-800">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse/Expand Button */}
      <div className="px-3 py-4 border-t border-gray-800/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 group relative"
        >
          {isCollapsed ? (
            <ChevronsRight className="w-[18px] h-[18px]" />
          ) : (
            <ChevronsLeft className="w-[18px] h-[18px]" />
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs text-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 border border-gray-800">
              Expand
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SideBar;
