import { Coord, RepoDetails } from "./types";
import { assert } from "./utils";

const gridSize = { x: 54, y: 64 };
const offset = { x: 52, y: 42 };
const commitRadius = 16;

export class Visualizer {
  static canvas: HTMLCanvasElement;
  static context: CanvasRenderingContext2D;
  static socket: WebSocket;
  static details: RepoDetails;

  static init(userID: string) {
    const canvas = document.querySelector<HTMLCanvasElement>("#visualizer");
    assert(canvas !== null);
    this.canvas = canvas;

    const context = canvas.getContext("2d");
    assert(context !== null);
    this.context = context;

    this.socket = new WebSocket("ws://localhost:8081/repo-details");
    this.socket.onmessage = (ev: MessageEvent<string>) => {
      console.log(ev.data);
      const details = JSON.parse(ev.data);
      if (details.type === "error") {
        console.error(ev.data);
        return;
      }
      this.details = details;
      renderGraph(context, this.details);
    };

    this.socket.onopen = () => {
      this.socket.send(userID);
    };

    window.addEventListener("resize", this.fit);
    this.fit();
  }

  static fit = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    renderGraph(this.context, this.details);
  };
}

function renderGraph(context: CanvasRenderingContext2D, details: RepoDetails) {
  const canvas = context.canvas;
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
}

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
  const parentY = Math.min(...parents.map((p) => p.y));
  for (let parent of parents) {
    c.moveTo(coord.x, coord.y + commitRadius);
    const diff = parentY - coord.y - 2 * commitRadius;
    const coef = 1;
    const cp1 = [coord.x, coord.y + commitRadius + diff * coef];
    const cp2 = [parent.x, parentY - commitRadius - diff * coef];
    c.bezierCurveTo(
      cp1[0],
      cp1[1],
      cp2[0],
      cp2[1],
      parent.x,
      parentY - commitRadius
    );
    if (parent.y !== parentY) {
      c.moveTo(parent.x, parentY - commitRadius);
      c.lineTo(parent.x, parent.y - commitRadius);
    }
    if (/*display control points=*/ false) {
      c.moveTo(cp1[0], cp1[1]);
      c.ellipse(cp1[0], cp1[1], 1, 1, 0, 0, 2 * Math.PI);
      c.moveTo(cp2[0], cp2[1]);
      c.ellipse(cp2[0], cp2[1], 1, 1, 0, 0, 2 * Math.PI);
    }
  }
  c.stroke();

  c.restore();
}
