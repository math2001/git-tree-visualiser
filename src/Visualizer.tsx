import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
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

const gridSize = { x: 54, y: 64 };
const offset = { x: 52, y: -42 };
const commitRadius = 16;
const branchNameOffset = 18;

function renderCommit(
  context: CanvasRenderingContext2D,
  details: RepoDetails,
  hash: string,
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
  context.fillText(details.commits[hash].message, offset.x + x, offset.y + y);
  const liaison = details.commits[hash].liaison;
  if (liaison) {
    context.fillText(
      `${liaison.recursiveChildren.left} ${liaison.recursiveChildren.right}`,
      offset.x + x,
      offset.y + y - commitRadius - 6
    );
  }
}

type Coor = { x: number; y: number };

function drawCurveTo(context: CanvasRenderingContext2D, from: Coor, to: Coor) {
  if (false) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = "grey";
    context.moveTo(offset.x + from.x, offset.y + from.y - commitRadius);
    // context.lineTo(offset.x + to.x, offset.y + to.y - commitRadius);
    context.bezierCurveTo(
      // control point 1
      offset.x + from.x,
      offset.y + to.y + commitRadius,
      // control point 2
      offset.x + to.x,
      offset.y + from.y - commitRadius,
      // target point
      offset.x + to.x,
      offset.y + to.y + commitRadius
    );
    context.stroke();
  }

  // first handle

  context.lineWidth = 2;
  context.strokeStyle = "black";

  if (from.x === to.x) {
    context.moveTo(offset.x + from.x, offset.y + from.y - commitRadius);
    context.lineTo(offset.x + to.x, offset.y + to.y + commitRadius);
  } else {
    const turn = { x: 0, y: -(gridSize.y - 2 * commitRadius) / 2 };
    turn.x = -turn.y;

    turn.x *= (from.x - to.x) / Math.abs(from.x - to.x);

    context.beginPath();
    // first handle
    context.moveTo(
      offset.x + from.x,
      offset.y + from.y - commitRadius
      // p
    );
    const coef = 0.8;
    context.bezierCurveTo(
      // control point 1
      offset.x + from.x,
      offset.y + from.y - commitRadius + turn.y * coef,
      // control point 2
      offset.x + from.x - turn.x * (1 - coef),
      offset.y + from.y - commitRadius + turn.y,
      // target
      offset.x + from.x - turn.x,
      offset.y + from.y - commitRadius + turn.y
    );

    // second handle
    context.moveTo(
      offset.x + to.x,
      offset.y + to.y + commitRadius
      // p
    );
    context.bezierCurveTo(
      // control point 1
      offset.x + to.x,
      offset.y + to.y + commitRadius - turn.y,
      // control point 2
      offset.x + to.x,
      offset.y + to.y + commitRadius - turn.y,
      // target
      offset.x + to.x + turn.x,
      offset.y + to.y + commitRadius - turn.y
    );

    // line in between
    context.moveTo(
      offset.x + from.x - turn.x,
      offset.y + from.y - commitRadius + turn.y
    );
    context.lineTo(
      offset.x + to.x + turn.x,
      offset.y + to.y + commitRadius - turn.y
    );
  }
  context.stroke();
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

function canGuaranteeCorrectness(details: RepoDetails) {
  let i = 0;
  let queue = [details.roots[0]];
  let hasSplitOff = false;
  while (queue.length > 0 && i < 100) {
    i++;
    const hash = queue.shift();
    if (!hash) throw new Error("wot?");

    if (details.commits[hash].children.length === 2) {
      if (hasSplitOff) {
        return false;
      }
      hasSplitOff = true;
      for (let child of details.commits[hash].children) {
        queue.push(child);
      }
    } else if (details.commits[hash].children.length === 1) {
      queue.push(details.commits[hash].children[0]);
    }
  }
  if (i === 100) throw new Error("safety broken");
  return true;
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
      offsetX = canvas.width / 2;
      // offsetX =
      //   (canvas.width * liaison.recursiveChildren.left) /
      //   (liaison.recursiveChildren.left + liaison.recursiveChildren.right);
      offsetX -= offset.x;
    } else {
      offsetX = canvas.width / 2;
    }

    // queue of rows of commits
    type Row = { hash: string; offsetX: number; rowIndex: number }[];
    const queue: Row[] = [[{ hash: details.roots[0], offsetX, rowIndex: 0 }]];

    offsetX = void 0; // offsetX tripped me up. You want commit.offsetX

    while (queue.length > 0) {
      const row = queue.shift();
      if (!row) throw new Error("wot");

      for (let commit of row) {
        renderCommit(
          context,
          details,
          commit.hash,
          commit.offsetX,
          context.canvas.height - commit.rowIndex * gridSize.y
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
            rowIndex: commit.rowIndex + 1,
          });
        } else if (children.length % 2 === 1) {
          const middle = Math.floor(children.length / 2);

          nextRow.push({
            hash: children[middle],
            offsetX: commit.offsetX,
            rowIndex: commit.rowIndex + 1,
          });
          // left = widths[middle] / 2;
          // right = widths[middle] / 2;

          for (let i = 1; i <= middle; i++) {
            const newLeft = left + widths[middle - i];
            nextRow.unshift({
              hash: children[middle - i],
              offsetX:
                commit.offsetX - (left + widths[middle - i]) * gridSize.x,
              rowIndex: commit.rowIndex + 1,
            });
            left = newLeft;

            const newRight = right + widths[middle + i];
            nextRow.push({
              hash: children[middle + i],
              offsetX:
                commit.offsetX + (right + widths[middle + i]) * gridSize.x,
              rowIndex: commit.rowIndex + 1,
            });
            right = newRight;
          }
        } else {
          left = 0.5;
          right = 0.5;
          for (let i = 0; i < children.length / 2; i++) {
            // left
            const newLeft = left + widths[children.length / 2 - 1 - i];

            nextRow.unshift({
              hash: children[children.length / 2 - 1 - i],
              offsetX: commit.offsetX - ((left + newLeft) / 2) * gridSize.x,
              rowIndex: commit.rowIndex + 1,
            });
            left = newLeft;

            // right
            const newRight = right + widths[children.length / 2 + i];
            nextRow.push({
              hash: children[children.length / 2 + i],
              offsetX: commit.offsetX + ((right + newRight) / 2) * gridSize.x,
              rowIndex: commit.rowIndex + 1,
            });
            right = newRight;
          }
        }
        for (let nextcommit of nextRow) {
          drawCurveTo(
            context,
            /*from=*/ {
              x: commit.offsetX,
              y: context.canvas.height - commit.rowIndex * gridSize.y,
            },
            /*to=*/ {
              x: nextcommit.offsetX,
              y: context.canvas.height - (commit.rowIndex + 1) * gridSize.y,
            }
          );
        }
        queue.push(nextRow);
      }
    }

    // const rendered: {
    //   [key: string]: { rowIndex: number; columnIndex: number };
    // } = {};
  });

  const [pos, setPos] = useState([0, 0]);

  return (
    <Container>
      {!canGuaranteeCorrectness(details) && (
        <article>
          <p>
            Uh uh. Your repository might be to complex... The rendering
            algorithm is quite silly because it was written by me, and it
            doesn't guarantee that it'll show you the correct representation of
            your commit graph.
          </p>
        </article>
      )}
      <p>
        <code>
          [{pos[0]}, {pos[1]}]
        </code>
      </p>
      <Canvas
        ref={canvasRef}
        width="1024"
        height="840"
        onMouseMove={(e) => {
          setPos([
            e.pageX - (e.target as HTMLElement).offsetLeft,
            e.pageY - (e.target as HTMLElement).offsetTop,
          ]);
        }}
      ></Canvas>
    </Container>
  );
}
