export interface InvertedRepoDetails {
  commits: { [hash: string]: { message: string; parents: string[] } };
  branches: { [key: string]: string };
  HEAD: string;
}

export interface RepoDetails {
  commits: { [hash: string]: { message: string; children: string[] } };
  branches: { [key: string]: string };
  HEAD: string;
}
