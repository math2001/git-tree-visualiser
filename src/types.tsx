export interface InvertedRepoDetails {
  commits: { [hash: string]: { message: string; parents: string[] } };
  branches: { [key: string]: string };
  HEAD: string;
}

export interface RepoDetails {
  commits: {
    [hash: string]: {
      message: string;
      children: string[];
      liaison?: Liaison;
    };
  };
  branches: { [key: string]: string };
  roots: string[];
  HEAD: string;
}

export interface Liaison {
  recursiveChildren: { left: number; right: number };
}
