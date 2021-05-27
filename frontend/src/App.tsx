import React, { useState } from "react";
import styled from "styled-components";
import { simpleMerge } from "./sample_repos";
import { Terminal } from "./Terminal";
import { RepoDetails } from "./types";
import { Visualizer } from "./Visualizer";

const Container = styled.div`
  height: 100vh;
`;

export default function App() {
  const [details, setDetails] = useState<RepoDetails | null>(null);

  if (details === null) {
    setDetails(simpleMerge);
  }

  if (details === null) {
    return <p>Loading, please wait</p>;
  }

  return (
    <Container>
      <Terminal />
      <Visualizer details={details} />
    </Container>
  );
}
