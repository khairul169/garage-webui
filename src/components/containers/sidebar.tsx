import { cn } from "@/lib/utils";
import {
  ArchiveIcon,
  HardDrive,
  KeySquare,
  LayoutDashboard,
} from "lucide-react";
import { Menu } from "react-daisyui";
import { Link, useLocation } from "react-router-dom";

const pages = [
  { icon: LayoutDashboard, title: "Dashboard", path: "/", exact: true },
  { icon: HardDrive, title: "Cluster", path: "/cluster" },
  { icon: ArchiveIcon, title: "Buckets", path: "/buckets" },
  { icon: KeySquare, title: "Keys", path: "/keys" },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="bg-base-100 border-r border-base-300/30 w-[220px] overflow-y-auto">
      <div className="p-4">
        <img
          src="https://garagehq.deuxfleurs.fr/images/garage-logo.svg"
          alt="logo"
          className="w-full max-w-[100px] mx-auto"
        />
        <p className="text-sm font-medium text-center">WebUI</p>
      </div>
      <Menu className="gap-y-1">
        {pages.map((page) => {
          const isActive = page.exact
            ? pathname === page.path
            : pathname.startsWith(page.path);
          return (
            <Menu.Item key={page.path}>
              <Link
                to={page.path}
                className={cn(
                  "h-12 flex items-center px-6",
                  isActive &&
                    "bg-primary text-primary-content hover:bg-primary/60 focus:bg-primary"
                )}
              >
                <page.icon size={18} />
                <p>{page.title}</p>
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </aside>
  );
};

export default Sidebar;
