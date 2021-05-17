import { createRef, useEffect } from "react";
import { Terminal as XTermTerminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { assert } from "./utils";
import "./xterm.css";

export function Terminal() {
  const socketEndpoint =
    "ws://localhost:4243/containers/d25e5f273295de8054a305abf2fe03ddc6523f5d00dee5e6ba7917ab3703aa56/attach/ws";
  const ref = createRef<HTMLDivElement>();
  const term = new XTermTerminal();
  {
    const socket = new WebSocket(socketEndpoint);
    const attachAdon = new AttachAddon(socket);
    term.loadAddon(attachAdon);
  }
  useEffect(() => {
    assert(!!ref.current);
    term.open(ref.current);
  });
  return <div ref={ref}></div>;
}
