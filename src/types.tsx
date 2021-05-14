export interface RepoDetails {
  commits: {
    [hash: string]: {
      message: string;
      children: string[];
      parents: string[];
    };
  };
  branches: { [key: string]: string };
  roots: string[];
  HEAD: string;
}

export interface Coord {
  x: number;
  y: number;
}
