import { createRef, useEffect } from "react";
import styled from "styled-components";
import "./xterm.css";

const Container = styled.div`
  width: 50%;
  height: 100%;
`;

function useOnResizeEnd(cb: (e: UIEvent) => void, delayms: number = 100) {
  useEffect(() => {
    let timeoutID: number | null = null;

    const listener = (e: UIEvent) => {
      if (timeoutID !== null) window.clearTimeout(timeoutID);
      timeoutID = window.setTimeout(() => cb(e), delayms);
    };

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener);
    };
  });
}

export function Terminal() {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    console.log("called once!");
    const socketEndpoint = "ws://localhost:8081/attach";

    // const term = new XTermTerminal({});

    let userID: string | null = null;
    const socket = new WebSocket(socketEndpoint);

    // const getUserID = (e: MessageEvent<string>) => {
    //   userID = e.data;
    //   e.stopImmediatePropagation();
    //   socket.removeEventListener("message", getUserID);

    //   // once we have the user id, listen for resize events
    //   term.onResize(async ({ rows, cols }) => {
    //     console.log("resize cb!", userID, rows, cols);
    //     const response = await fetch(
    //       `http://localhost:8081/resize?width=${cols}&height=${rows}&user-id=${userID}`
    //     );
    //     if (response.status !== 200) {
    //       const body = await response.text();
    //       alert(`invalid resize response: ${body}`);
    //     }
    //   });
    // };
    // socket.addEventListener("message", getUserID);

    // const attachAddon = new AttachAddon(socket);
    // const fitAddon = new FitAddon();
    // const unicodeAddon = new Unicode11Addon();
    // term.loadAddon(fitAddon);
    // term.loadAddon(attachAddon);
    // term.loadAddon(unicodeAddon);

    // useOnResizeEnd(() => {
    //   fitAddon.fit();
    // });

    // assert(!!ref.current);
    // term.open(ref.current);
    // fitAddon.fit();
  });

  // // @ts-ignore
  // window.sendResize = function (data: string) {
  //   if (socket.readyState !== 1) {
  //     throw new Error("socket not ready");
  //   }
  //   const buffer = new Uint8Array(data.length);
  //   for (let i = 0; i < data.length; ++i) {
  //     buffer[i] = data.charCodeAt(i) & 255;
  //   }
  //   console.log(buffer);
  //   socket.send(buffer);
  // };
  // // @ts-ignore
  // window.proposeDim = () => {
  //   console.log(fitAddon.proposeDimensions());
  // };

  return <Container ref={ref}></Container>;
}
