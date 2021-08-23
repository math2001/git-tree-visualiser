import { Terminal } from "./Terminal";
import { assert } from "./utils";
import { Visualizer } from "./Visualizer";
import "./xterm.css";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("#app-root");
  assert(root !== null);

  const termSocket = new WebSocket("ws://localhost:8081/attach");
  getUserID(termSocket, (userID: string) => {
    Terminal.init(termSocket, userID);
    Visualizer.init(userID);
  });
});

// reads the first message (the user id), and no more
function getUserID(termSocket: WebSocket, userCb: (userID: string) => void) {
  const cb = (e: MessageEvent<string>) => {
    userCb(e.data);
    e.stopImmediatePropagation();
    termSocket.removeEventListener("message", cb);
  };
  termSocket.addEventListener("message", cb);
}
