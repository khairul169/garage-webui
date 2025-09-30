//

export type Key = {
  id: string;
  name: string;
};

export type KeyWithSecret = Key & {
  secretAccessKey: string;
};
