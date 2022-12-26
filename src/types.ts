export interface ModuleInfo {
  _id: string;
  _rev: string;
  name: string;
  description: string;
  "dist-tags": Record<string, string>;
  time: {
    // "1.0.0-beta.10": "2018-01-10T16:33:08.512Z",
    [x: string]: string;
  };
  versions: Record<string, ModuleVersion>;
}

interface ModuleVersion {
  name: string;
  version: string;
  description: string;
  repository: {
    type: "git" | string;
    url: string;
  };
  homepage: string;
  author: {
    name: string;
  };
  license: string;
}
