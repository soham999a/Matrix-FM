import { NavLink } from "react-router-dom";
import { Home, Radio, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "Now", icon: Home },
  { to: "/stations", label: "Explore", icon: Radio },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ink border-t border-hairline flex items-center justify-around px-grid-2" style={{ height: "calc(56px + env(safe-area-inset-bottom, 0px))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
              isActive
                ? "text-gold"
                : "text-slate hover:text-bone"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <tab.icon
                size={20}
                className={isActive ? "fill-gold" : ""}
              />
              <span className={`font-ui text-[10px] tracking-wider ${
                isActive ? "font-medium" : ""
              }`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
