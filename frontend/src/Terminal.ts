import { Terminal as XTerm } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { assert, debounce } from "./utils";

export class Terminal {
  static term: XTerm;

  static init(socket: WebSocket, userID: string) {
    this.term = new XTerm();

    const domNode = document.querySelector<HTMLDivElement>("#terminal");
    assert(domNode !== null);
    this.term.open(domNode);

    this.term.onResize(async ({ rows, cols }) => {
      console.log("resize cb!", userID, rows, cols);
      const response = await fetch("http://localhost:8081/resize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          width: cols,
          height: rows,
          userID: userID,
        }),
      });
      if (response.status !== 200) {
        const body = await response.text();
        alert(`invalid resize response: ${body}`);
      }
    });

    this.term.loadAddon(new AttachAddon(socket));
    const unicodeAddon = new Unicode11Addon();
    const fitAddon = new FitAddon();

    this.term.loadAddon(unicodeAddon);
    this.term.loadAddon(fitAddon);

    window.addEventListener(
      "resize",
      debounce(() => {
        fitAddon.fit();
      })
    );
  }
}
