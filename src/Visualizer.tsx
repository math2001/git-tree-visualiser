import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Coord, RepoDetails } from "./types";
import { assert } from "./utils";

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
const offset = { x: 52, y: 42 };
const commitRadius = 16;
const branchNameOffset = 18;

function renderCommitAndLinks(
  c: CanvasRenderingContext2D,
  details: RepoDetails,
  hash: string,
  coord: Coord,
  parents: Coord[]
) {
  c.save();

  c.strokeStyle = "black";
  c.fillStyle = "none";
  c.lineWidth = 2;

  c.beginPath();
  c.ellipse(coord.x, coord.y, commitRadius, commitRadius, 0, 0, 2 * Math.PI);
  c.stroke();

  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(details.commits[hash].message, coord.x, coord.y);

  c.beginPath();
  for (let parent of parents) {
    c.moveTo(coord.x, coord.y + commitRadius);
    c.bezierCurveTo(
      coord.x,
      coord.y + commitRadius,
      parent.x,
      parent.y - commitRadius,
      parent.x,
      parent.y - commitRadius
    );
  }
  c.stroke();

  c.restore();
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

export function Visualizer({ details }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("canvas is null");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("context is null");

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (details.roots.length !== 1) throw new Error("expect one root exactly");

    const rendered: { [key: string]: { x: number; y: number } } = {};
    const queue: string[] = [details.roots[0]];

    // for each commit
    //   if it has no parent, render in the middle
    //   if it has one parent
    //      if it has sibling, or there is a branch pointing to the parent
    //         nudge x
    //   if it has two parents and the two parents have been rendered
    //      render

    while (queue.length) {
      const hash = queue.shift();
      assert(hash !== undefined);
      const parents = details.commits[hash].parents;
      let x, y;
      let shouldRender = true;
      if (parents.length === 0) {
        x = canvas.width / 2;
        y = canvas.height - offset.y;
      } else if (parents.length === 1) {
        const parent = parents[0];
        y = rendered[parent].y - gridSize.y;
        x = rendered[parent].x;
        // if parent has two children, or there is a branch pointing the the parent commit
        // we branch off
        const siblings = details.commits[parent].children;
        console.log(
          details.commits[hash].message,
          hash,
          siblings.length,
          details.branches
        );
        if (
          siblings.length === 2 ||
          Object.values(details.branches).includes(parent)
        ) {
          const index = siblings.indexOf(hash);
          if (index === -2 || index === 0) {
            x -= gridSize.x;
          } else {
            x += gridSize.x;
          }
        }
      } else {
        assert(parents.length === 2);
        for (let parent of parents) {
          if (!rendered[parent]) {
            shouldRender = false;
          }
        }
        if (shouldRender) {
          x = (rendered[parents[0]].x + rendered[parents[1]].x) / 2;
          y = Math.min(...parents.map((h) => rendered[h].y)) - gridSize.y;
        }
      }
      if (shouldRender) {
        assert(x !== undefined);
        assert(y !== undefined);
        rendered[hash] = { x, y };
        renderCommitAndLinks(
          context,
          details,
          hash,
          { x, y },
          parents.map((h) => rendered[h])
        );
      }
      for (let child of details.commits[hash].children) {
        queue.push(child);
      }
    }
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
