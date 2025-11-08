import AccessKeyPermissions from "./access-keys";
import CorsConfiguration from "./cors-configuration";

const PermissionsTab = () => {
  return (
    <div className="space-y-5">
      <AccessKeyPermissions />
      <CorsConfiguration />
    </div>
  );
};

export default PermissionsTab;
