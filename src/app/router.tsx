import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "@/components/layouts/auth-layout";
import MainLayout from "@/components/layouts/main-layout";
import ClusterPage from "@/pages/cluster/page";
import HomePage from "@/pages/home/page";

const router = createBrowserRouter([
  {
    path: "/auth",
    Component: AuthLayout,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "cluster",
        Component: ClusterPage,
      },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
