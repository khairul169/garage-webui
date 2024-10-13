import { useParams } from "react-router-dom";
import { useBucket } from "./hooks";
import Page from "@/context/page-context";
import TabView, { Tab } from "@/components/containers/tab-view";
import {
  ChartLine,
  CircleXIcon,
  FolderSearch,
  LockKeyhole,
} from "lucide-react";
import OverviewTab from "./overview/overview-tab";
import PermissionsTab from "./permissions/permissions-tab";
import MenuButton from "./components/menu-button";
import BrowseTab from "./browse/browse-tab";
import { BucketContext } from "./context";
import { Alert, Loading } from "react-daisyui";

const tabs: Tab[] = [
  {
    name: "overview",
    title: "Overview",
    icon: ChartLine,
    Component: OverviewTab,
  },
  {
    name: "permissions",
    title: "Permissions",
    icon: LockKeyhole,
    Component: PermissionsTab,
  },
  {
    name: "browse",
    title: "Browse",
    icon: FolderSearch,
    Component: BrowseTab,
  },
];

const ManageBucketPage = () => {
  const { id } = useParams();
  const { data, error, isLoading, refetch } = useBucket(id);

  const name = data?.globalAliases[0];

  return (
    <>
      <Page
        title={name || "Manage Bucket"}
        prev="/buckets"
        actions={data ? <MenuButton /> : undefined}
      />

      {isLoading && (
        <div className="h-full flex items-center justify-center">
          <Loading size="lg" />
        </div>
      )}

      {error != null && (
        <Alert status="error" icon={<CircleXIcon />}>
          <span>{error.message}</span>
        </Alert>
      )}

      {data && (
        <div className="container">
          <BucketContext.Provider
            value={{ bucket: data, refetch, bucketName: name || "" }}
          >
            <TabView tabs={tabs} className="bg-base-100 h-14 px-1.5" />
          </BucketContext.Provider>
        </div>
      )}
    </>
  );
};

export default ManageBucketPage;
