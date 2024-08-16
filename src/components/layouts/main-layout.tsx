import { PageContext } from "@/context/page-context";
import { Suspense, useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../containers/sidebar";
import { ArrowLeft, MenuIcon } from "lucide-react";
import Button from "../ui/button";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Drawer } from "react-daisyui";

const MainLayout = () => {
  const sidebar = useDisclosure();
  const { pathname } = useLocation();

  useEffect(() => {
    if (sidebar.isOpen) {
      sidebar.onClose();
    }
  }, [pathname]);

  return (
    <Drawer
      open={sidebar.isOpen}
      onClickOverlay={sidebar.onClose}
      className="md:drawer-open h-screen"
      side={<Sidebar />}
      contentClassName="flex flex-col overflow-hidden"
    >
      <Header onSidebarOpen={sidebar.onOpen} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Suspense>
          <Outlet />
        </Suspense>
      </main>
    </Drawer>
  );
};

type HeaderProps = {
  onSidebarOpen: () => void;
};

const Header = ({ onSidebarOpen }: HeaderProps) => {
  const page = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <header className="bg-base-100 px-4 md:px-8">
      <div className="container h-16 md:h-20 flex flex-row items-center gap-4">
        {page?.prev ? (
          <Button
            href={page.prev}
            onClick={() => navigate(page.prev!, { replace: true })}
            color="ghost"
            shape="circle"
            className="-mx-2"
          >
            <ArrowLeft />
          </Button>
        ) : (
          <Button
            icon={MenuIcon}
            color="ghost"
            className="md:hidden -mx-2"
            onClick={onSidebarOpen}
          />
        )}

        <h1 className="text-xl flex-1 truncate">
          {page?.title || "Dashboard"}
        </h1>

        {page?.actions}
      </div>
    </header>
  );
};

export default MainLayout;
