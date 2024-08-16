import { cn, ucfirst } from "@/lib/utils";
import {
  ArchiveIcon,
  HardDrive,
  KeySquare,
  LayoutDashboard,
  Palette,
} from "lucide-react";
import { Dropdown, Menu } from "react-daisyui";
import { Link, useLocation } from "react-router-dom";
import Button from "../ui/button";
import { themes } from "@/app/themes";
import appStore from "@/stores/app-store";
import garageLogo from "@/assets/garage-logo.svg";

const pages = [
  { icon: LayoutDashboard, title: "Dashboard", path: "/", exact: true },
  { icon: HardDrive, title: "Cluster", path: "/cluster" },
  { icon: ArchiveIcon, title: "Buckets", path: "/buckets" },
  { icon: KeySquare, title: "Keys", path: "/keys" },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="bg-base-100 border-r border-base-300/30 w-[80%] md:w-[250px] flex flex-col items-stretch overflow-hidden h-full">
      <div className="p-4">
        <img
          src={garageLogo}
          alt="logo"
          className="w-full max-w-[100px] mx-auto"
        />
        <p className="text-sm font-medium text-center">WebUI</p>
      </div>

      <Menu className="gap-y-1 flex-1 overflow-y-auto">
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
                    "bg-primary text-primary-content hover:bg-primary/60 focus:bg-primary focus:text-primary-content"
                )}
              >
                <page.icon size={18} />
                <p>{page.title}</p>
              </Link>
            </Menu.Item>
          );
        })}
      </Menu>

      <Dropdown className="my-2 mx-4" vertical="top">
        <Dropdown.Toggle button={false}>
          <Button icon={Palette} color="ghost">
            Theme
          </Button>
        </Dropdown.Toggle>

        <Dropdown.Menu className="max-h-[200px] overflow-y-auto">
          {themes.map((theme) => (
            <Dropdown.Item key={theme} onClick={() => appStore.setTheme(theme)}>
              {ucfirst(theme)}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </aside>
  );
};

export default Sidebar;
