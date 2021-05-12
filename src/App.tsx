import {
  isCommaListExpression,
  reduceEachTrailingCommentRange,
} from "typescript";
import { InvertedRepoDetails, RepoDetails } from "./types";
import { Visualizer } from "./Visualizer";

const details: RepoDetails = {
  commits: {
    "1c03d0fe4189ba16e6120d4b19d11018f75b7366": { message: "D", children: [] },
    "8f772f3fbdb6cbbaafda3b36a139ac162efac7cb": { message: "F", children: [] },
    b3f911558a5a0999b0c3d0e9dc5b391af769d0cb: { message: "G", children: [] },
    a3c2fc71b30795f9f7aab495c30fc6adfd27e619: {
      message: "E",
      children: [
        "8f772f3fbdb6cbbaafda3b36a139ac162efac7cb",
        "b3f911558a5a0999b0c3d0e9dc5b391af769d0cb",
      ],
    },
    "4297040ed5dbd1f8119fa72b1f3a167632ed6af0": {
      message: "C",
      children: ["a3c2fc71b30795f9f7aab495c30fc6adfd27e619"],
    },
    "21789931c91538e6ff8f3a586ad91ef4ab69fad7": {
      message: "B",
      children: [
        "1c03d0fe4189ba16e6120d4b19d11018f75b7366",
        "4297040ed5dbd1f8119fa72b1f3a167632ed6af0",
      ],
    },
    cedd0e59c61af767c27f7447753659a3c954aaf2: {
      message: "A",
      children: ["21789931c91538e6ff8f3a586ad91ef4ab69fad7"],
    },
  },
  branches: {
    main: "hash6",
    "new-feature": "hash5",
  },
  HEAD: "main",
};

function invert(details: InvertedRepoDetails): RepoDetails {
  const commits: { [key: string]: { children: string[]; message: string } } =
    {};
  for (let [hash, data] of Object.entries(details.commits)) {
    const { parents, ...rest } = data;
    if (!commits[hash]) {
      commits[hash] = { ...rest, children: [] };
    }
    for (let parent of parents) {
      if (!commits[parent]) {
        commits[parent] = { ...rest, children: [] };
      } else {
        commits[parent].children.push(hash);
      }
    }
  }
  return {
    ...details,
    commits,
  };
}

function findRootCommit(details: RepoDetails): string[] {
  const hashes = new Set<string>();
  const childrens = new Set<string>();
  for (let [hash, commit] of Object.entries(details.commits)) {
    hashes.add(hash);
    for (let child of commit.children) {
      childrens.add(child);
    }
  }

  return Array.from(hashes).filter((hash) => !childrens.has(hash));
}

function makeLiaison(
  details: RepoDetails,
  root?: string
): { left: number; right: number } {
  const d = (hash: string) => details.commits[hash];
  console.log("making liaison for", root ? d(root).message : root);
  if (!root) {
    const roots = findRootCommit(details);
    if (roots.length !== 1) {
      throw new Error(`expect exactly one root, got ${roots.length}`);
    }
    root = roots[0];
    console.log("root is", d(root).message);
  }

  let hash: string | null = root;
  let i = 0;
  while (hash !== null && i < 100) {
    i++;
    if (details.commits[hash].children.length === 0) {
      hash = null;
    } else if (details.commits[hash].children.length === 1) {
      hash = details.commits[hash].children[0];
    } else {
      const commit = details.commits[hash];
      const recursiveChildren: { left: number; right: number }[] = [];
      for (let child of commit.children) {
        if (child === undefined) throw new Error("yikes");
        recursiveChildren.push(makeLiaison(details, child));
      }
      if (commit.children.length === 0) continue;

      let left = recursiveChildren.length / 2;
      let right = left;

      console.log(commit.message, recursiveChildren);

      for (let i = 0; i < recursiveChildren.length; i++) {
        if (i < recursiveChildren.length / 2) {
          left += recursiveChildren[i].left + recursiveChildren[i].right;
        } else if (i >= recursiveChildren.length / 2) {
          right += recursiveChildren[i].left + recursiveChildren[i].right;
        } else {
          left += recursiveChildren[i].left;
          right += recursiveChildren[i].right;
        }
      }
      commit.liaison = {
        recursiveChildren: { left, right },
      };
      return { left, right };
    }
  }
  if (i === 100) throw new Error("what the heck");
  return { left: 0, right: 0 };
}

function App() {
  makeLiaison(details);
  for (let commit of Object.values(details.commits)) {
    console.log(
      commit.message,
      commit.liaison?.recursiveChildren.left,
      commit.liaison?.recursiveChildren.right
    );
  }
  return (
    <div className="App">
      <Visualizer details={details} />
    </div>
  );
}

export default App;
