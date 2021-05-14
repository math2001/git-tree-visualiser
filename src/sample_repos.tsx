import { RepoDetails } from "./types";

export const doubleSplit: RepoDetails = {
  roots: ["root"],
  HEAD: "main",
  branches: {
    main: "hashA1",
    first: "hashB1",
  },
  commits: {
    root: {
      message: "root",
      children: ["hashA", "hashB"],
    },
    hashA: {
      message: "A",
      children: ["hashA1"],
    },
    hashB: {
      message: "B",
      children: ["hashB1"],
    },
    hashA1: {
      message: "A1",
      children: [],
    },
    hashB1: {
      message: "B1",
      children: [],
    },
  },
};

export const doubleNestedSplit: RepoDetails = {
  roots: ["root"],
  HEAD: "main",
  branches: {
    main: "hashA1",
    first: "hashB1",
  },
  commits: {
    root: {
      message: "root",
      children: ["hashA", "hashB"],
    },
    hashA: {
      message: "A",
      children: ["hashA1"],
    },
    hashB: {
      message: "B",
      children: ["hashB1", "hashB2"],
    },
    hashA1: {
      message: "A1",
      children: [],
    },
    hashB1: {
      message: "B1",
      children: [],
    },
    hashB2: {
      message: "B2",
      children: [],
    },
  },
};

export const tripleSplit: RepoDetails = {
  roots: ["root"],
  HEAD: "main",
  branches: {
    main: "hashA1",
    first: "hashB1",
    second: "hashC1",
  },
  commits: {
    root: {
      message: "root",
      children: ["hashA", "hashB", "hashC"],
    },
    hashA: {
      message: "A",
      children: ["hashA1"],
    },
    hashB: {
      message: "B",
      children: ["hashB1"],
    },
    hashC: {
      message: "C",
      children: ["hashC1"],
    },
    hashA1: {
      message: "A1",
      children: [],
    },
    hashB1: {
      message: "B1",
      children: [],
    },
    hashC1: {
      message: "C1",
      children: [],
    },
  },
};

export const tripleSplitNested: RepoDetails = {
  roots: ["root"],
  HEAD: "main",
  branches: {
    main: "hashA1",
    first: "hashB1",
    second: "hashC1",
    third: "hashCA1",
  },
  commits: {
    root: {
      message: "root",
      children: ["hashA", "hashB", "hashC"],
    },
    hashA: {
      message: "A",
      children: ["hashA1"],
    },
    hashB: {
      message: "B",
      children: ["hashB1"],
    },
    hashC: {
      message: "C",
      children: ["hashC1", "hashCA", "hashCB"],
    },
    hashA1: {
      message: "A1",
      children: [],
    },
    hashB1: {
      message: "B1",
      children: [],
    },
    hashC1: {
      message: "C1",
      children: [],
    },
    hashCA: {
      message: "CA",
      children: ["hashCA1"],
    },
    hashCA1: {
      message: "CA1",
      children: [],
    },
    hashCB: {
      message: "CB",
      children: ["hashCB1"],
    },
    hashCB1: {
      message: "CB1",
      children: [],
    },
  },
};

export const quadrupleSplit: RepoDetails = {
  roots: ["root"],
  HEAD: "main",
  branches: {
    main: "hashA1",
    first: "hashB1",
    second: "hashC1",
    third: "hashD1",
  },
  commits: {
    root: {
      message: "root",
      children: ["hashA", "hashB", "hashC", "hashD"],
    },
    hashA: {
      message: "A",
      children: ["hashA1"],
    },
    hashB: {
      message: "B",
      children: ["hashB1"],
    },
    hashA1: {
      message: "A1",
      children: [],
    },
    hashB1: {
      message: "B1",
      children: [],
    },
    hashC: {
      message: "C",
      children: ["hashC1"],
    },
    hashD: {
      message: "D",
      children: ["hashD1"],
    },
    hashC1: {
      message: "C1",
      children: [],
    },
    hashD1: {
      message: "D1",
      children: [],
    },
  },
};

export const simpleMerge: RepoDetails = {
  commits: {
    "0e8263d0629d919e9c85efe0ab8e7a6c204f27be": { message: "D", children: [] },
    d0cb176ba7e24a1c25afd04e5d410e5d534601d7: {
      message: "C1",
      children: ["0e8263d0629d919e9c85efe0ab8e7a6c204f27be"],
    },
    "5bf462982ece0641cae9cd2700ed969c2454f0a9": {
      message: "B1",
      children: ["0e8263d0629d919e9c85efe0ab8e7a6c204f27be"],
    },
    d662e9f080b3d679606e0522086a3cab4abdbe6d: {
      message: "A",
      children: [
        "5bf462982ece0641cae9cd2700ed969c2454f0a9",
        "d0cb176ba7e24a1c25afd04e5d410e5d534601d7",
      ],
    },
  },
  roots: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
  branches: {
    feature: "5bf462982ece0641cae9cd2700ed969c2454f0a9",
    main: "0e8263d0629d919e9c85efe0ab8e7a6c204f27be",
  },
  HEAD: "main",
};

export const unevenMerge: RepoDetails = {
  commits: {
    "5ff9f6844a97fafb62451492bbda557e9c300552": { message: "D", children: [] },
    afb9e2dd01ca87c48d0a8a0f3f42d506032c1fa4: {
      message: "C2",
      children: ["5ff9f6844a97fafb62451492bbda557e9c300552"],
    },
    d0cb176ba7e24a1c25afd04e5d410e5d534601d7: {
      message: "C1",
      children: ["afb9e2dd01ca87c48d0a8a0f3f42d506032c1fa4"],
    },
    "5bf462982ece0641cae9cd2700ed969c2454f0a9": {
      message: "B1",
      children: ["5ff9f6844a97fafb62451492bbda557e9c300552"],
    },
    d662e9f080b3d679606e0522086a3cab4abdbe6d: {
      message: "A",
      children: [
        "5bf462982ece0641cae9cd2700ed969c2454f0a9",
        "d0cb176ba7e24a1c25afd04e5d410e5d534601d7",
      ],
    },
  },
  roots: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
  branches: {
    feature: "5bf462982ece0641cae9cd2700ed969c2454f0a9",
    main: "5ff9f6844a97fafb62451492bbda557e9c300552",
  },
  HEAD: "main",
};
