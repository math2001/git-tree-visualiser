import "./index.css";
import { Terminal } from "./Terminal";
import { SERVER_ADDRESS } from "./utils";
import { Visualizer } from "./Visualizer";
import "./xterm.css";

document.addEventListener("DOMContentLoaded", () => {
  const termSocket = new WebSocket(`ws://${SERVER_ADDRESS}/attach`);
  termSocket.addEventListener("error", (ev: Event) => {
    console.error("TermSocket error", ev)
  })
  termSocket.addEventListener("close", (ev: Event) => {
    console.error("TermSocket close", ev)
  })
  getUserID(termSocket, (userID: string) => {
    Terminal.init(termSocket, userID);
    Visualizer.init(userID);
  });
});

// reads the first message (the user id), and no more
function getUserID(termSocket: WebSocket, userCb: (userID: string) => void) {
  const cb = (e: MessageEvent<string>) => {
    e.stopImmediatePropagation();
    termSocket.removeEventListener("message", cb);
    userCb(e.data);
  };
  termSocket.addEventListener("message", cb);
}
