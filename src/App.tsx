import { Visualizer } from "./Visualizer";

const details = {
  commits: {
    "848cbfdf4eceafe567a5ef1d63574d4286316256": {
      message: "D",
      children: [],
      parents: [
        "0ed6afbcf9c326d7e272e207b50f0f16f96e704a",
        "b7ac3531598c43bb5f07ef0e7fbcf0d4c895615c",
      ],
    },
    "0ed6afbcf9c326d7e272e207b50f0f16f96e704a": {
      message: "B2",
      children: ["848cbfdf4eceafe567a5ef1d63574d4286316256"],
      parents: ["5bf462982ece0641cae9cd2700ed969c2454f0a9"],
    },
    b7ac3531598c43bb5f07ef0e7fbcf0d4c895615c: {
      message: "C3",
      children: ["848cbfdf4eceafe567a5ef1d63574d4286316256"],
      parents: ["2c8a8f021bcbd2972a2dda326fdd0b75c307edb9"],
    },
    "2c8a8f021bcbd2972a2dda326fdd0b75c307edb9": {
      message: "C2",
      children: ["b7ac3531598c43bb5f07ef0e7fbcf0d4c895615c"],
      parents: ["d0cb176ba7e24a1c25afd04e5d410e5d534601d7"],
    },
    d0cb176ba7e24a1c25afd04e5d410e5d534601d7: {
      message: "C1",
      children: ["2c8a8f021bcbd2972a2dda326fdd0b75c307edb9"],
      parents: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
    },
    "5bf462982ece0641cae9cd2700ed969c2454f0a9": {
      message: "B1",
      children: ["0ed6afbcf9c326d7e272e207b50f0f16f96e704a"],
      parents: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
    },
    d662e9f080b3d679606e0522086a3cab4abdbe6d: {
      message: "A",
      children: [
        "5bf462982ece0641cae9cd2700ed969c2454f0a9",
        "d0cb176ba7e24a1c25afd04e5d410e5d534601d7",
      ],
      parents: [],
    },
  },
  roots: ["d662e9f080b3d679606e0522086a3cab4abdbe6d"],
  branches: {
    feature: "0ed6afbcf9c326d7e272e207b50f0f16f96e704a",
    main: "848cbfdf4eceafe567a5ef1d63574d4286316256",
  },
  HEAD: "main",
};

function App() {
  return (
    <div className="App">
      <Visualizer details={details} />
    </div>
  );
}

export default App;
