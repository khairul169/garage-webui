import { useParams } from "react-router-dom";
import { useBucket } from "./hooks";
import Page from "@/context/page-context";
import TabView, { Tab } from "@/components/containers/tab-view";
import { ChartLine, FolderSearch, LockKeyhole } from "lucide-react";
import OverviewTab from "./overview/overview-tab";
import PermissionsTab from "./permissions/permissions-tab";
import MenuButton from "./components/menu-button";
import BrowseTab from "./browse/browse-tab";

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
  const { data } = useBucket(id);

  const name = data?.globalAliases[0];

  return (
    <div className="container">
      <Page
        title={name || "Manage Bucket"}
        prev="/buckets"
        actions={<MenuButton />}
      />
      <TabView tabs={tabs} className="bg-base-100 h-14 px-1.5" />
    </div>
  );
};

export default ManageBucketPage;
