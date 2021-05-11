import { InvertedRepoDetails, RepoDetails } from "./types";
import { Visualizer } from "./Visualizer";

const details: InvertedRepoDetails = {
  commits: {
    hash1: {
      message: "first commit",
      parents: [],
    },
    hash2: {
      message: "second commit",
      parents: ["hash1"],
    },
    hash3: {
      message: "third commit",
      parents: ["hash2"],
    },
    hash4: {
      message: "branched off!",
      parents: ["hash2"],
    },
    hash5: {
      message: "working on that new feature",
      parents: ["hash4"],
    },
    hash6: {
      message: "regular work still goes on",
      parents: ["hash3"],
    },
    // hash7: {
    //   message: "merge commit!",
    //   parents: ["hash5", "hash6"],
    // },
    // hash8: {
    //   message: "Git is great",
    //   parents: ["hash7"],
    // },
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

function App() {
  return (
    <div className="App">
      <Visualizer details={invert(details)} />
    </div>
  );
}

export default App;
