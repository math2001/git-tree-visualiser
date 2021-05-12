import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Liaison, RepoDetails } from "./types";

interface Props {
  details: RepoDetails;
}

const Container = styled.div``;
const Canvas = styled.canvas`
  border: 1px solid black;
  margin: 12px auto;
  display: block;
`;

const gridSize = { x: 38, y: 48 };
const offset = { x: 52, y: 52 };
const commitRadius = 16;
const branchNameOffset = 18;

function renderCommit(
  context: CanvasRenderingContext2D,
  commitHash: string,
  x: number,
  y: number
) {
  context.strokeStyle = "black";
  context.fillStyle = "none";
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(
    offset.x + x,
    offset.y + y,
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
  context.fillText(commitHash, offset.x + x, offset.y + y);
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
    offset.x + gridSize.x * columnIndex,
    branchNameOffset
  );
  if (isHead)
    context.fillText(
      "_".repeat(branchName.length),
      offset.x + gridSize.x * columnIndex,
      branchNameOffset
    );
}

function findFirstLiaison(details: RepoDetails, hash: string): Liaison | null {
  let i = 0;
  while (i < 100) {
    if (details.commits[hash].children.length === 0) break;
    else if (details.commits[hash].children.length === 1)
      hash = details.commits[hash].children[0];
    else {
      const liaison = details.commits[hash].liaison;
      if (!liaison)
        throw new Error(
          `liason should not be null on commit with multiple childrens ${hash}`
        );
      return liaison;
    }
  }
  if (i === 100) throw new Error("safety broke");
  return null;
}

export function Visualizer({ details }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("canvas is null");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("context is null");

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (details.roots.length !== 1) throw new Error("expect one root exactly");

    let liaison = findFirstLiaison(details, details.roots[0]);
    let offsetX;
    if (liaison) {
      offsetX =
        (canvas.width * liaison.recursiveChildren.left) /
        (liaison.recursiveChildren.left + liaison.recursiveChildren.right);
    } else {
      offsetX = canvas.width / 2;
    }

    let rowIndex = 0;
    // queue of rows of commits
    type Row = { hash: string; offsetX: number }[];
    const queue: Row[] = [[{ hash: details.roots[0], offsetX }]];

    offsetX = void 0; // offsetX tripped me up. You want commit.offsetX

    while (queue.length > 0) {
      const row = queue.shift();
      if (!row) throw new Error("wot");

      for (let commit of row) {
        renderCommit(
          context,
          details.commits[commit.hash].message,
          commit.offsetX,
          rowIndex * gridSize.y
        );
        const children = details.commits[commit.hash].children;
        if (children.length === 0) continue;

        let widths = children.map((child) => {
          const liaison = findFirstLiaison(details, child);
          if (liaison)
            return (
              liaison.recursiveChildren.left + liaison.recursiveChildren.right
            );
          return 1;
        }, 0);

        let nextRow: Row = [];
        let left = 0;
        let right = 0;
        if (children.length === 1) {
          nextRow.push({
            hash: children[0],
            offsetX: commit.offsetX,
          });
        } else if (children.length % 2 === 1) {
          const middle = Math.floor(children.length / 2);

          nextRow.push({
            hash: children[middle],
            offsetX: commit.offsetX,
          });
          left = widths[middle] / 2;
          right = widths[middle] / 2;

          for (let i = 1; i <= middle; i++) {
            const newLeft = left + widths[middle - i];
            nextRow.unshift({
              hash: children[middle - i],
              offsetX: commit.offsetX - ((left + newLeft) / 2) * gridSize.x,
            });
            left = newLeft;

            const newRight = right + widths[middle + i];
            nextRow.push({
              hash: children[middle + i],
              offsetX: commit.offsetX + ((right + newRight) / 2) * gridSize.x,
            });
            right = newRight;
          }
        } else {
          for (let i = 0; i < children.length / 2; i++) {
            // left
            const newLeft = left + widths[children.length / 2 - 1 - i];

            nextRow.unshift({
              hash: children[children.length / 2 - 1 - i],
              offsetX: commit.offsetX - ((left + newLeft) / 2) * gridSize.x,
            });
            left = newLeft;

            // right
            const newRight = right + widths[children.length / 2 + i];
            nextRow.push({
              hash: children[children.length / 2 + i],
              offsetX: commit.offsetX + ((right + newRight) / 2) * gridSize.x,
            });
            right = newRight;
          }
        }
        queue.push(nextRow);
      }
      rowIndex++;
    }

    // const rendered: {
    //   [key: string]: { rowIndex: number; columnIndex: number };
    // } = {};
  });

  return (
    <Container>
      <Canvas ref={canvasRef} width="1024" height="840"></Canvas>
    </Container>
  );
}
