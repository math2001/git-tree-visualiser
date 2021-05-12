import { RepoDetails } from "./types";
import { Visualizer } from "./Visualizer";

let details: RepoDetails = {
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

details = {
  commits: {
    "1a5da1a7a356b19f6af8699bc7182bac6ca839b4": { message: "F", children: [] },
    "584c6065aaf5b6e0d19f7626ad3520460f455611": { message: "E", children: [] },
    e63015c583d6979fee476421628111c0d1a588c7: {
      message: "D",
      children: ["1a5da1a7a356b19f6af8699bc7182bac6ca839b4"],
    },
    "3b187a4b340dc5e525e8d1bb13bf2c9a756c0e8a": {
      message: "C",
      children: ["1a5da1a7a356b19f6af8699bc7182bac6ca839b4"],
    },
    "4c1bd12d14c852bd75c181d4b2f9857276e599b8": {
      message: "B",
      children: [
        "3b187a4b340dc5e525e8d1bb13bf2c9a756c0e8a",
        "584c6065aaf5b6e0d19f7626ad3520460f455611",
        "e63015c583d6979fee476421628111c0d1a588c7",
      ],
    },
    e4afb73878d8f3dea6c906fc5b21e0e7d5745686: {
      message: "A",
      children: ["4c1bd12d14c852bd75c181d4b2f9857276e599b8"],
    },
  },
  roots: ["e4afb73878d8f3dea6c906fc5b21e0e7d5745686"],
  branches: {
    master: "3b187a4b340dc5e525e8d1bb13bf2c9a756c0e8a",
    second: "1a5da1a7a356b19f6af8699bc7182bac6ca839b4",
    third: "584c6065aaf5b6e0d19f7626ad3520460f455611",
  },
  HEAD: "master",
};

if (false)
  details = {
    commits: {
      f6bee074a0102f21b6f1916882bd48c65b5d8107: { message: "J6", children: [] },
      c0238900525e54e6070e958422cb8db13714a376: {
        message: "J5",
        children: ["f6bee074a0102f21b6f1916882bd48c65b5d8107"],
      },
      e0f8a7886d62b9316449800937833beb4ace0bf5: {
        message: "J4",
        children: ["c0238900525e54e6070e958422cb8db13714a376"],
      },
      f08848a7bce4719f0afa207f17282ce146f51d7a: {
        message: "J3",
        children: ["e0f8a7886d62b9316449800937833beb4ace0bf5"],
      },
      "650b9264f9fe062ba9f2c7321b36ca96efff461a": {
        message: "J2",
        children: ["f08848a7bce4719f0afa207f17282ce146f51d7a"],
      },
      d644c8a6d119ff22a06cfd03b8a172940e7313b3: {
        message: "J1",
        children: ["650b9264f9fe062ba9f2c7321b36ca96efff461a"],
      },
      "44a5d0c762c9034dd07b5752dbbe159e8bf732ef": {
        message: "AA",
        children: [],
      },
      "28bbb2c7bbdbd33691302a727ff209586be05d8f": {
        message: "Z",
        children: [],
      },
      a33f8f67f7c35b2fc7fb88770968ef7e2a755c80: { message: "X", children: [] },
      e2dabe623b1fa639e130cd21500b6905d1394e2d: { message: "Y", children: [] },
      e9c8576b45ea87ca385909a5debb99c1ae10e52a: {
        message: "U",
        children: [
          "28bbb2c7bbdbd33691302a727ff209586be05d8f",
          "44a5d0c762c9034dd07b5752dbbe159e8bf732ef",
          "a33f8f67f7c35b2fc7fb88770968ef7e2a755c80",
          "e2dabe623b1fa639e130cd21500b6905d1394e2d",
        ],
      },
      fd61a4c15be30eee7c0301c9176431338d4982a1: { message: "V", children: [] },
      aa5df37e7943478bb13d956dcea0cd947f624e88: { message: "W", children: [] },
      "55894610b8c444ff93fca2fb4b19c48c6300a75a": {
        message: "S",
        children: [
          "aa5df37e7943478bb13d956dcea0cd947f624e88",
          "e9c8576b45ea87ca385909a5debb99c1ae10e52a",
          "fd61a4c15be30eee7c0301c9176431338d4982a1",
        ],
      },
      de786cefcad017fb4eb7d6f8e7cda99cd3fc5e08: { message: "Q", children: [] },
      cc0debd6c8c84ab26cb0fa1f41475fd3792c43d3: { message: "T", children: [] },
      "078d96223b5c0398f48dcf473c31e6170f00833a": {
        message: "N",
        children: [],
      },
      "25c32e7c5d3e6eedb9504caf398dabea7db6497a": {
        message: "M",
        children: ["078d96223b5c0398f48dcf473c31e6170f00833a"],
      },
      "3ac6b47b38b47527605b1681ab2b1c934fc78409": {
        message: "J",
        children: ["d644c8a6d119ff22a06cfd03b8a172940e7313b3"],
      },
      f483e0bab1641b225d0d5a52c3d2330c04c90b08: { message: "P", children: [] },
      fff72ff362b40c4bb7b8880af7494aeca10d4996: {
        message: "O",
        children: ["f483e0bab1641b225d0d5a52c3d2330c04c90b08"],
      },
      b740c6d98235d1d0c048839370f85abf3c9ff94e: {
        message: "L",
        children: [
          "25c32e7c5d3e6eedb9504caf398dabea7db6497a",
          "fff72ff362b40c4bb7b8880af7494aeca10d4996",
        ],
      },
      "856b0431fe4402d9bacc84cd28880696f5343e0d": {
        message: "K",
        children: ["b740c6d98235d1d0c048839370f85abf3c9ff94e"],
      },
      e18418cb856c9e518395cde9e72f43996f001e76: {
        message: "I",
        children: [
          "3ac6b47b38b47527605b1681ab2b1c934fc78409",
          "856b0431fe4402d9bacc84cd28880696f5343e0d",
        ],
      },
      "78d1694cf2ca798c7ca4674d0f487b372bb91f75": {
        message: "H",
        children: ["e18418cb856c9e518395cde9e72f43996f001e76"],
      },
      "1c03d0fe4189ba16e6120d4b19d11018f75b7366": {
        message: "D",
        children: [
          "55894610b8c444ff93fca2fb4b19c48c6300a75a",
          "cc0debd6c8c84ab26cb0fa1f41475fd3792c43d3",
          "de786cefcad017fb4eb7d6f8e7cda99cd3fc5e08",
        ],
      },
      "8f772f3fbdb6cbbaafda3b36a139ac162efac7cb": {
        message: "F",
        children: [],
      },
      b3f911558a5a0999b0c3d0e9dc5b391af769d0cb: {
        message: "G",
        children: ["78d1694cf2ca798c7ca4674d0f487b372bb91f75"],
      },
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
      b1: "cc0debd6c8c84ab26cb0fa1f41475fd3792c43d3",
      b10: "e2dabe623b1fa639e130cd21500b6905d1394e2d",
      b11: "a33f8f67f7c35b2fc7fb88770968ef7e2a755c80",
      b12: "28bbb2c7bbdbd33691302a727ff209586be05d8f",
      b2: "de786cefcad017fb4eb7d6f8e7cda99cd3fc5e08",
      b4: "aa5df37e7943478bb13d956dcea0cd947f624e88",
      d5: "fd61a4c15be30eee7c0301c9176431338d4982a1",
      first: "8f772f3fbdb6cbbaafda3b36a139ac162efac7cb",
      fourth: "f483e0bab1641b225d0d5a52c3d2330c04c90b08",
      main: "44a5d0c762c9034dd07b5752dbbe159e8bf732ef",
      second: "f6bee074a0102f21b6f1916882bd48c65b5d8107",
      third: "078d96223b5c0398f48dcf473c31e6170f00833a",
    },
    HEAD: "second",
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
