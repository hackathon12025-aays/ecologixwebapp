import { useState } from "react";
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Award,
  Recycle,
  Settings,
  Leaf,
  Plus,
} from "lucide-react";

export default function EcologixSidebar({ activePage = "deliveries" }) {
  const navigationItems = [
    { id: "dashboard", path: "/", icon: LayoutDashboard, label: "Dashboard" },
    {
      id: "new-delivery",
      path: "/new-delivery",
      icon: Plus,
      label: "New Delivery",
    },
    { id: "deliveries", path: "/deliveries", icon: Truck, label: "Deliveries" },
    {
      id: "analytics",
      path: "/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
    { id: "eco-points", path: "/eco-points", icon: Award, label: "Eco-Points" },
    { id: "recycling", path: "/recycling", icon: Recycle, label: "Recycling" },
  ];

  const handleNavClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="w-18 sm:w-20 bg-white dark:bg-[#1E1E1E] flex flex-col h-full font-inter">
      {/* Logo + Navigation */}
      <div className="flex flex-col items-center pt-6">
        {/* Brand Logo - Ecologix */}
        <button
          onClick={() => handleNavClick("/")}
          className="mb-6 cursor-pointer flex flex-col items-center"
          title="Ecologix"
        >
          <Leaf
            size={32}
            className="text-[#10B981] dark:text-[#34D399]"
            strokeWidth={2}
          />
          <span className="text-[8px] font-bold text-[#10B981] dark:text-[#34D399] mt-1">
            ECO
          </span>
        </button>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#10B9811A] dark:bg-[#34D399]/20 hover:bg-[#10B98126] dark:hover:bg-[#34D399]/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                `}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent
                  size={20}
                  className={`
                    ${
                      isActive
                        ? "text-[#10B981] dark:text-[#34D399] opacity-100"
                        : "text-[#6B7280] dark:text-[#9CA3AF] opacity-65 hover:opacity-80"
                    } 
                    transition-opacity duration-200
                  `}
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer to push settings to bottom */}
      <div className="flex-1"></div>

      {/* Settings - Bottom */}
      <div className="flex justify-center pb-6">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          title="Settings"
          aria-label="Settings"
        >
          <Settings
            size={20}
            className="text-[#6B7280] dark:text-[#9CA3AF] opacity-65 hover:opacity-80 transition-opacity duration-200"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
