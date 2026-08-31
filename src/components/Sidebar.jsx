import { NavLink } from "react-router-dom";
import { Home } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    {
      path: "/collections",
      label: "Collections",
      icon: <Home size={18} />,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
