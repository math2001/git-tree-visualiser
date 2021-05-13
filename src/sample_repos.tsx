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
