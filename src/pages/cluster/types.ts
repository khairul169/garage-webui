//

export type GetStatusResult = {
  node: string;
  garageVersion: string;
  garageFeatures: string[];
  rustVersion: string;
  dbEngine: string;
  layoutVersion: number;
  nodes?: Node[];
  knownNodes?: Node[];
  layout?: GetClusterLayoutResult;
};

export type Node = {
  id: string;
  role?: Role | StagedRole;
  addr: string;
  hostname: string;
  isUp: boolean;
  lastSeenSecsAgo: number | null;
  draining?: boolean;
  dataPartition?: DataPartition;
  metadataPartition?: DataPartition;
};

export type DataPartition = {
  available: number;
  total: number;
};

export type Role = {
  id: string;
  zone: string;
  capacity: number;
  tags: string[];
};

export type StagedRole = { id: string; remove: boolean } & Partial<
  Omit<Role, "id">
>;

export type GetClusterLayoutResult = {
  version: number;
  roles: Role[];
  stagedRoleChanges: StagedRole[];
};

export type AssignNodeBody = {
  id: string;
  zone: string;
  capacity: number | null;
  tags: string[];
};

export type ApplyLayoutResult = {
  message: string[];
  layout: GetClusterLayoutResult;
};
