import { RepoDetails } from "./types";
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
  roots: ["cedd0e59c61af767c27f7447753659a3c954aaf2"],
  branches: {
    first: "8f772f3fbdb6cbbaafda3b36a139ac162efac7cb",
    main: "1c03d0fe4189ba16e6120d4b19d11018f75b7366",
    second: "b3f911558a5a0999b0c3d0e9dc5b391af769d0cb",
  },
  HEAD: "main",
};

function makeLiaison(
  details: RepoDetails,
  root?: string
): { left: number; right: number } {
  if (!root) {
    if (details.roots.length !== 1) {
      throw new Error(`expect exactly one root, got ${details.roots.length}`);
    }
    root = details.roots[0];
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
  return (
    <div className="App">
      <Visualizer details={details} />
    </div>
  );
}

export default App;
