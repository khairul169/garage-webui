import { Cylinder, HardDrive, LayoutDashboard } from "lucide-react";
import { Menu } from "react-daisyui";
import { Link } from "react-router-dom";

const Sidebar = () => {
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
        <Menu.Item>
          <Link to="/">
            <LayoutDashboard />
            <p>Dashboard</p>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/cluster">
            <HardDrive />
            <p>Cluster</p>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/buckets">
            <Cylinder />
            <p>Buckets</p>
          </Link>
        </Menu.Item>
      </Menu>
    </aside>
  );
};

export default Sidebar;
