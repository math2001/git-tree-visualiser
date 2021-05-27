// export const doubleSplit: RepoDetails = {
//   roots: ["root"],
//   HEAD: "main",
//   branches: {
//     main: "hashA1",
//     first: "hashB1",
//   },
//   commits: {
//     root: {
//       message: "root",
//       children: ["hashA", "hashB"],
//     },
//     hashA: {
//       message: "A",
//       children: ["hashA1"],
//     },
//     hashB: {
//       message: "B",
//       children: ["hashB1"],
//     },
//     hashA1: {
//       message: "A1",
//       children: [],
//     },
//     hashB1: {
//       message: "B1",
//       children: [],
//     },
//   },
// };

import { RepoDetails } from "./types";

// export const doubleNestedSplit: RepoDetails = {
//   roots: ["root"],
//   HEAD: "main",
//   branches: {
//     main: "hashA1",
//     first: "hashB1",
//   },
//   commits: {
//     root: {
//       message: "root",
//       children: ["hashA", "hashB"],
//     },
//     hashA: {
//       message: "A",
//       children: ["hashA1"],
//     },
//     hashB: {
//       message: "B",
//       children: ["hashB1", "hashB2"],
//     },
//     hashA1: {
//       message: "A1",
//       children: [],
//     },
//     hashB1: {
//       message: "B1",
//       children: [],
//     },
//     hashB2: {
//       message: "B2",
//       children: [],
//     },
//   },
// };

// export const tripleSplit: RepoDetails = {
//   roots: ["root"],
//   HEAD: "main",
//   branches: {
//     main: "hashA1",
//     first: "hashB1",
//     second: "hashC1",
//   },
//   commits: {
//     root: {
//       message: "root",
//       children: ["hashA", "hashB", "hashC"],
//     },
//     hashA: {
//       message: "A",
//       children: ["hashA1"],
//     },
//     hashB: {
//       message: "B",
//       children: ["hashB1"],
//     },
//     hashC: {
//       message: "C",
//       children: ["hashC1"],
//     },
//     hashA1: {
//       message: "A1",
//       children: [],
//     },
//     hashB1: {
//       message: "B1",
//       children: [],
//     },
//     hashC1: {
//       message: "C1",
//       children: [],
//     },
//   },
// };

// export const tripleSplitNested: RepoDetails = {
//   roots: ["root"],
//   HEAD: "main",
//   branches: {
//     main: "hashA1",
//     first: "hashB1",
//     second: "hashC1",
//     third: "hashCA1",
//   },
//   commits: {
//     root: {
//       message: "root",
//       children: ["hashA", "hashB", "hashC"],
//     },
//     hashA: {
//       message: "A",
//       children: ["hashA1"],
//     },
//     hashB: {
//       message: "B",
//       children: ["hashB1"],
//     },
//     hashC: {
//       message: "C",
//       children: ["hashC1", "hashCA", "hashCB"],
//     },
//     hashA1: {
//       message: "A1",
//       children: [],
//     },
//     hashB1: {
//       message: "B1",
//       children: [],
//     },
//     hashC1: {
//       message: "C1",
//       children: [],
//     },
//     hashCA: {
//       message: "CA",
//       children: ["hashCA1"],
//     },
//     hashCA1: {
//       message: "CA1",
//       children: [],
//     },
//     hashCB: {
//       message: "CB",
//       children: ["hashCB1"],
//     },
//     hashCB1: {
//       message: "CB1",
//       children: [],
//     },
//   },
// };

// export const quadrupleSplit: RepoDetails = {
//   roots: ["root"],
//   HEAD: "main",
//   branches: {
//     main: "hashA1",
//     first: "hashB1",
//     second: "hashC1",
//     third: "hashD1",
//   },
//   commits: {
//     root: {
//       message: "root",
//       children: ["hashA", "hashB", "hashC", "hashD"],
//     },
//     hashA: {
//       message: "A",
//       children: ["hashA1"],
//     },
//     hashB: {
//       message: "B",
//       children: ["hashB1"],
//     },
//     hashA1: {
//       message: "A1",
//       children: [],
//     },
//     hashB1: {
//       message: "B1",
//       children: [],
//     },
//     hashC: {
//       message: "C",
//       children: ["hashC1"],
//     },
//     hashD: {
//       message: "D",
//       children: ["hashD1"],
//     },
//     hashC1: {
//       message: "C1",
//       children: [],
//     },
//     hashD1: {
//       message: "D1",
//       children: [],
//     },
//   },
// };

// export const simpleMerge: RepoDetails = {
//   commits: {
//     "0e8263d0629d919e9c85efe0ab8e7a6c204f27be": { message: "D", children: [] },
//     d0cb176ba7e24a1c25afd04e5d410e5d534601d7: {
//       message: "C1",
//       children: ["0e8263d0629d919e9c85efe0ab8e7a6c204f27be"],
//     },
//     "5bf462982ece0641cae9cd2700ed969c2454f0a9": {
//       message: "B1",
//       children: ["0e8263d0629d919e9c85efe0ab8e7a6c204f27be"],
//     },
//     d662e9f080b3d679606e0522086a3cab4abdbe6d: {
//       message: "A",
//       children: [
//         "5bf462982ece0641cae9cd2700ed969c2454f0a9",
//         "d0cb176ba7e24a1c25afd04e5d410e5d534601d7",
//       ],
//     },
//   },
//   roots: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
//   branches: {
//     feature: "5bf462982ece0641cae9cd2700ed969c2454f0a9",
//     main: "0e8263d0629d919e9c85efe0ab8e7a6c204f27be",
//   },
//   HEAD: "main",
// };

// export const unevenMerge: RepoDetails = {
//   commits: {
//     "5ff9f6844a97fafb62451492bbda557e9c300552": { message: "D", children: [] },
//     afb9e2dd01ca87c48d0a8a0f3f42d506032c1fa4: {
//       message: "C2",
//       children: ["5ff9f6844a97fafb62451492bbda557e9c300552"],
//     },
//     d0cb176ba7e24a1c25afd04e5d410e5d534601d7: {
//       message: "C1",
//       children: ["afb9e2dd01ca87c48d0a8a0f3f42d506032c1fa4"],
//     },
//     "5bf462982ece0641cae9cd2700ed969c2454f0a9": {
//       message: "B1",
//       children: ["5ff9f6844a97fafb62451492bbda557e9c300552"],
//     },
//     d662e9f080b3d679606e0522086a3cab4abdbe6d: {
//       message: "A",
//       children: [
//         "5bf462982ece0641cae9cd2700ed969c2454f0a9",
//         "d0cb176ba7e24a1c25afd04e5d410e5d534601d7",
//       ],
//     },
//   },
//   roots: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
//   branches: {
//     feature: "5bf462982ece0641cae9cd2700ed969c2454f0a9",
//     main: "5ff9f6844a97fafb62451492bbda557e9c300552",
//   },
//   HEAD: "main",
// };

export const simpleMerge: RepoDetails = {
  commits: {
    "15199a4ae752f509731eecd41197ee26663c42e4": {
      message: "resizing terminal working!",
      children: [],
      parents: ["13e1dec193509a99e5711e3fbbe8d2b9fa53d493"],
    },
    "13e1dec193509a99e5711e3fbbe8d2b9fa53d493": {
      message: "dockershell: ensure coroutines terminate",
      children: ["15199a4ae752f509731eecd41197ee26663c42e4"],
      parents: ["d8f053999d857a7dc255fa4d16d3257712ebe2c7"],
    },
    d8f053999d857a7dc255fa4d16d3257712ebe2c7: {
      message: "handle closing websockets in reading loop",
      children: ["13e1dec193509a99e5711e3fbbe8d2b9fa53d493"],
      parents: ["c508478a2b845986fcda9d136e3af6e7a923d673"],
    },
    c508478a2b845986fcda9d136e3af6e7a923d673: {
      message: "terminal rudimentarily working",
      children: ["d8f053999d857a7dc255fa4d16d3257712ebe2c7"],
      parents: ["51807855007142d959cb7c38e906d98a7aa922c6"],
    },
    "51807855007142d959cb7c38e906d98a7aa922c6": {
      message: "implement quick server, and it works!",
      children: ["c508478a2b845986fcda9d136e3af6e7a923d673"],
      parents: ["f36c869749a307a75cd7c34ad17ee7cc67db8a94"],
    },
    f36c869749a307a75cd7c34ad17ee7cc67db8a94: {
      message: "use cubic bezier curve for links between commits",
      children: ["51807855007142d959cb7c38e906d98a7aa922c6"],
      parents: ["c730557483c5ed2edfeaf94991ec9c3c13bb58ff"],
    },
    c730557483c5ed2edfeaf94991ec9c3c13bb58ff: {
      message: "rendering two-branch tree structure works",
      children: ["f36c869749a307a75cd7c34ad17ee7cc67db8a94"],
      parents: ["eb91ab10e2c96b278575f43b96b425eae54a2c5f"],
    },
    eb91ab10e2c96b278575f43b96b425eae54a2c5f: {
      message: "add some repos",
      children: ["c730557483c5ed2edfeaf94991ec9c3c13bb58ff"],
      parents: ["cdf16bcd74df871f32831963d5d6a3bf7c3317fa"],
    },
    cdf16bcd74df871f32831963d5d6a3bf7c3317fa: {
      message: "fix up and add warning",
      children: ["eb91ab10e2c96b278575f43b96b425eae54a2c5f"],
      parents: ["986570772199b49746e2b5b653005e061d866a35"],
    },
    "986570772199b49746e2b5b653005e061d866a35": {
      message: "add makefile",
      children: ["cdf16bcd74df871f32831963d5d6a3bf7c3317fa"],
      parents: ["c69b0ddf95797432e106d5f900f36744aa6128c7"],
    },
    c69b0ddf95797432e106d5f900f36744aa6128c7: {
      message: "add readme",
      children: ["986570772199b49746e2b5b653005e061d866a35"],
      parents: ["1baea1792b4475882788ada0f3692fd900390fb8"],
    },
    "1baea1792b4475882788ada0f3692fd900390fb8": {
      message: "render cubic bezier curves to connect commits",
      children: ["c69b0ddf95797432e106d5f900f36744aa6128c7"],
      parents: ["78c71e332def23b16ce80623e63ebc7f099778a9"],
    },
    "78c71e332def23b16ce80623e63ebc7f099778a9": {
      message: "implement but disable debug linking between commics",
      children: ["1baea1792b4475882788ada0f3692fd900390fb8"],
      parents: ["73b337ac2396955700d926187b5a044b456c491c"],
    },
    "73b337ac2396955700d926187b5a044b456c491c": {
      message: "rendering large tree working!",
      children: ["78c71e332def23b16ce80623e63ebc7f099778a9"],
      parents: ["6defdcabb910144ec4fdbf269ee1be7925e765f6"],
    },
    "6defdcabb910144ec4fdbf269ee1be7925e765f6": {
      message: "rendering limited trees working?",
      children: ["73b337ac2396955700d926187b5a044b456c491c"],
      parents: ["b6271be0206152a5bd91c7805f2d3b8e685a59f9"],
    },
    b6271be0206152a5bd91c7805f2d3b8e685a59f9: {
      message: "counting recursive children seems to be working",
      children: ["6defdcabb910144ec4fdbf269ee1be7925e765f6"],
      parents: ["79b49211e97df58d0be553692eea73b00ce267ec"],
    },
    "79b49211e97df58d0be553692eea73b00ce267ec": {
      message: "checkpoint",
      children: ["b6271be0206152a5bd91c7805f2d3b8e685a59f9"],
      parents: ["6accbc3850187178c0e15f2a2528dec03e260424"],
    },
    "6accbc3850187178c0e15f2a2528dec03e260424": {
      message: "Initialize project using Create React App",
      children: ["79b49211e97df58d0be553692eea73b00ce267ec"],
      parents: [],
    },
  },
  roots: ["6accbc3850187178c0e15f2a2528dec03e260424"],
  branches: {
    main: "eb91ab10e2c96b278575f43b96b425eae54a2c5f",
    "two-branches": "15199a4ae752f509731eecd41197ee26663c42e4",
  },
  HEAD: "two-branches",
};
