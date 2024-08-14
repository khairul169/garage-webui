import { PageContext } from "@/context/page-context";
import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu } from "react-daisyui";
import { HardDrive, LayoutDashboard } from "lucide-react";

const MainLayout = () => {
  return (
    <div className="flex flex-row items-stretch h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="container max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

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
      </Menu>
    </aside>
  );
};

const Header = () => {
  const page = useContext(PageContext);

  return (
    <header className="bg-base-100 p-4 md:p-8 md:py-6 flex flex-row items-center gap-4">
      <h1 className="text-2xl font-medium">{page?.title || "Dashboard"}</h1>
    </header>
  );
};

export default MainLayout;
