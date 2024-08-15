import { PageContext } from "@/context/page-context";
import { Suspense, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../containers/sidebar";
import { ArrowLeft } from "lucide-react";
import Button from "../ui/button";

const MainLayout = () => {
  return (
    <div className="flex flex-row items-stretch h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Suspense>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const Header = () => {
  const page = useContext(PageContext);
  const navigate = useNavigate();

  return (
    <header className="bg-base-100 px-4 h-16 md:px-8 md:h-20 flex flex-row items-center gap-4">
      {page?.prev ? (
        <Button
          href={page.prev}
          onClick={() => navigate(page.prev!, { replace: true })}
          color="ghost"
          shape="circle"
          className="-ml-4"
        >
          <ArrowLeft />
        </Button>
      ) : null}
      <h1 className="text-xl">{page?.title || "Dashboard"}</h1>
    </header>
  );
};

export default MainLayout;
