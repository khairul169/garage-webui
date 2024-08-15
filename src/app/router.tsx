import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";
import AuthLayout from "@/components/layouts/auth-layout";
import MainLayout from "@/components/layouts/main-layout";

const ClusterPage = lazy(() => import("@/pages/cluster/page"));
const HomePage = lazy(() => import("@/pages/home/page"));
const BucketsPage = lazy(() => import("@/pages/buckets/page"));
const ManageBucketPage = lazy(() => import("@/pages/buckets/manage/page"));

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
      {
        path: "buckets",
        children: [
          { index: true, Component: BucketsPage },
          { path: ":id", Component: ManageBucketPage },
        ],
      },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
