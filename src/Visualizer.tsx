import { useEffect, useRef } from "react";
import styled from "styled-components";
import { RepoDetails } from "./types";

interface Props {
  details: RepoDetails;
}

const Container = styled.div``;
const Canvas = styled.canvas`
  border: 1px solid black;
  margin: 12px auto;
  width: 640px;
  display: block;
`;

const columnSize = { x: 128, y: 78 };
const offset = { x: 48, y: 52 };
const commitRadius = 24;
const branchNameOffset = 18;

function renderCommit(
  context: CanvasRenderingContext2D,
  commitHash: string,
  columnIndex: number,
  rowIndex: number
) {
  context.strokeStyle = "black";
  context.fillStyle = "none";
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(
    offset.x + columnSize.x * columnIndex,
    offset.y + columnSize.y * rowIndex,
    commitRadius,
    commitRadius,
    0,
    0,
    2 * Math.PI
  );
  context.stroke();

  context.font = "10px monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    commitHash,
    offset.x + columnSize.x * columnIndex,
    offset.y + columnSize.y * rowIndex
  );
}

function renderBranchName(
  context: CanvasRenderingContext2D,
  branchName: string,
  columnIndex: number,
  isHead = false
) {
  context.font = "12px monospace";
  context.textAlign = "center";
  context.textBaseline = "bottom";
  context.fillText(
    branchName,
    offset.x + columnSize.x * columnIndex,
    branchNameOffset
  );
  if (isHead)
    context.fillText(
      "_".repeat(branchName.length),
      offset.x + columnSize.x * columnIndex,
      branchNameOffset
    );
}

export function Visualizer({ details }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("canvas is null");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("context is null");

    context.clearRect(0, 0, canvas.width, canvas.height);

    const rendered: {
      [key: string]: { rowIndex: number; columnIndex: number };
    } = {};

    let columnIndex = 0;
    return;

    const branches = [
      details.HEAD,
      ...Array.from(Object.keys(details.branches)).filter(
        (name) => name !== details.HEAD
      ),
    ];
    for (let branchName of branches) {
      let hash = details.branches[branchName];
      renderBranchName(
        context,
        branchName,
        columnIndex,
        branchName === details.HEAD
      );
      let rowIndex = 0;
      let i = 0;
      while (hash && i < 100) {
        i++;
        if (i === 100) throw new Error("what the fuck");

        if (!rendered[hash]) {
          renderCommit(context, hash, columnIndex, rowIndex);
          rendered[hash] = { rowIndex, columnIndex };
          rowIndex++;
        }
        hash = details.commits[hash].children[0];
      }
      columnIndex++;
    }
  });

  return (
    <Container>
      <Canvas ref={canvasRef} width="640" height="480"></Canvas>
    </Container>
  );
}
